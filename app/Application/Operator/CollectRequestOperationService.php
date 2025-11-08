<?php

namespace App\Application\Operator;

use App\Domain\CollectRequest\CollectRequestRepositoryInterface;
use App\Events\CollectRequestUpdated;
use App\Models\CollectRequest;
use App\Models\Device;
use App\Models\TemperatureLog;
use DateTime;
use DateTimeZone;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Reader\Csv;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CollectRequestOperationService
{
    public function __construct(
        private readonly CollectRequestRepositoryInterface $collectRequestRepository
    )
    {
    }

    public function getAssignedRequests(int $userId, array $filters = [])
    {
        $query = CollectRequest::where('user_id', $userId)
            ->with(['device', 'referrer']);

        // Apply date filter
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Apply referrer filter
        if (!empty($filters['referrer_id'])) {
            $query->where('referrer_id', $filters['referrer_id']);
        }

        // Apply status filter
        if (!empty($filters['status'])) {
            switch ($filters['status']) {
                case 'not_started':
                    $query->whereNull('started_at');
                    break;
                case 'in_progress':
                    $query->whereNotNull('started_at')->whereNull('ended_at');
                    break;
                case 'completed':
                    $query->whereNotNull('ended_at');
                    break;
            }
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getCollectRequestDetails(int $userId, int $requestId): ?array
    {
        $request = $this->collectRequestRepository->findById($requestId);

        if (!$request || $request->user_id !== $userId) {
            return null;
        }

        // Load relationships
        $request->load(['device', 'referrer']);

        // If the collect request has ended, get temperature logs within the time range
        $temperatureLogs = [];
        if ($request->ended_at && $request->device_id) {
            $temperatureLogs = TemperatureLog::where('device_id', $request->device_id)
                ->whereBetween('timestamp', [$request->started_at, $request->ended_at])
                ->orderBy('timestamp', 'asc')
                ->get();
        }

        return [
            'id' => $request->id,
            'user_id' => $request->user_id,
            'referrer_id' => $request->referrer_id,
            'server_id' => $request->server_id,
            'device_id' => $request->device_id,
            'started_at' => $request->started_at,
            'ended_at' => $request->ended_at,
            'barcodes' => $request->barcodes,
            'extra_information' => $request->extra_information,
            'created_at' => $request->created_at,
            'updated_at' => $request->updated_at,
            'device' => $request->device,
            'referrer' => $request->referrer,
            'temperature_logs' => $temperatureLogs,
        ];
    }

    /**
     * Select a collect request for collection (changes status to sample_collector_on_the_way)
     */
    public function selectForCollection(int $userId, int $requestId): CollectRequest
    {
        $request = $this->collectRequestRepository->findById($requestId);

        if (!$request) {
            throw new Exception('Collect request not found');
        }

        if ($request->user_id !== $userId) {
            throw new Exception('This request is not assigned to you');
        }

        // Check if status is pending or waiting_for_assign
        if (!in_array($request->status?->value, ['pending', 'waiting_for_assign'])) {
            throw new Exception('Can only select requests with pending or waiting_for_assign status');
        }

        // Check if operator already has an active collection (status = sample_collector_on_the_way)
        $activeCollection = CollectRequest::where('user_id', $userId)
            ->where('status', 'sample_collector_on_the_way')
            ->where('id', '!=', $requestId)
            ->first();

        if ($activeCollection) {
            throw new Exception('You already have an active collection. Please complete it before selecting another one.');
        }

        // Update status to sample_collector_on_the_way
        $updatedRequest = $this->collectRequestRepository->update($requestId, [
            'status' => 'sample_collector_on_the_way',
        ]);

        // Dispatch event to notify external server about the status change
        event(new CollectRequestUpdated([$requestId], 'selected'));

        return $updatedRequest;
    }

    public function startCollection(int $userId, int $requestId, array $data): CollectRequest
    {
        $request = $this->collectRequestRepository->findById($requestId);

        if (!$request) {
            throw new Exception('Collect request not found');
        }

        if ($request->user_id !== $userId) {
            throw new Exception('This request is not assigned to you');
        }

        // Validate status is sample_collector_on_the_way
        if ($request->status?->value !== 'sample_collector_on_the_way') {
            throw new Exception('Can only start collection for requests with status "sample_collector_on_the_way"');
        }

        if ($request->started_at) {
            throw new Exception('This request has already been started');
        }

        // Prepare extra information - start with existing data or empty array
        $extraInfo = is_array($request->extra_information) ? $request->extra_information : [];

        // Add starting location if provided
        if (isset($data['starting_location']) && is_array($data['starting_location'])) {
            $extraInfo['starting_location'] = [
                'latitude' => $data['starting_location']['latitude'],
                'longitude' => $data['starting_location']['longitude'],
                'accuracy' => $data['starting_location']['accuracy'] ?? null,
                'timestamp' => now()->toDateTimeString(),
            ];
        }

        $updateData = [
            'barcodes' => array_merge($request->barcodes ?? [], $data['barcodes'] ?? []),
            'started_at' => now(),
            'status' => 'picked_up',
        ];

        // Only add extra_information if there's data to save
        if (!empty($extraInfo)) {
            $updateData['extra_information'] = $extraInfo;
        }

        $updatedRequest = $this->collectRequestRepository->update($requestId, $updateData);

        // Dispatch event to notify external server about the start (single request)
        event(new CollectRequestUpdated([$requestId], 'started'));

        return $updatedRequest;
    }

    public function endCollections(int $userId, array $requestIds, $uploadedFile, ?array $endingLocation = null): array
    {

        DB::beginTransaction();

        try {
            // Store the uploaded file
            $filePath = $uploadedFile->store('temperature_logs', 'public');

            // Parse the file
            // Set up PhpSpreadsheet for CSV
            $reader = new Csv();

            // Detect encoding and set appropriate delimiter
            $fileContent = file_get_contents($uploadedFile->getRealPath());
            $isUtf16 = (substr($fileContent, 0, 2) === "\xFF\xFE" || substr($fileContent, 0, 2) === "\xFE\xFF");

            if ($isUtf16) {
                $reader->setInputEncoding('UTF-16LE');
                $reader->setDelimiter("\t"); // UTF-16 files typically use tab delimiter
            } else {
                $reader->setInputEncoding('UTF-8');
                $reader->setDelimiter(','); // Default comma delimiter
            }

            $spreadsheet = $reader->load($uploadedFile->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();

            // Log all cells in the first row for debugging
            $firstRow = $worksheet->rangeToArray('A1:D1', null, true, true, true)[1];
            Log::info('First row cells:', $firstRow);

            // Get MAC address from D1
            $macAddress = $this->getMacAddress($worksheet);

            // Find or create device
            $device = Device::firstOrCreate(['mac' => $macAddress]);

            // Parse temperature data
            $highestRow = $worksheet->getHighestRow();
            $highestColumn = $worksheet->getHighestColumn();

            // Determine header row (skip MAC address row if present)
            $headerRow = 1;
            $firstRowValue = $worksheet->getCell('A1')->getValue();
            if ($firstRowValue && preg_match('/MAC\s*Address/i', $firstRowValue)) {
                $headerRow = 2; // MAC address is in row 1, header is in row 2
            }

            // Check if we have only one column with data (column A or B is empty)
            $dataStartRow = $headerRow + 1;
            $isSingleColumn = $highestColumn === 'A' || empty($worksheet->getCell('B' . $dataStartRow)->getValue());

            // Start parsing from the row after header
            for ($row = $dataStartRow; $row <= $highestRow; $row++) {
                $datetime = null;
                $value = null;

                if ($isSingleColumn) {
                    // Single column format: "2025-11-06 00:00:00	7.98"
                    $cellValue = $worksheet->getCell('A' . $row)->getValue();

                    if ($cellValue) {
                        // Split by tab or multiple spaces
                        $parts = preg_split('/[\t\s]{2,}/', $cellValue, 2);

                        if (count($parts) === 2) {
                            $datetime = trim($parts[0]);
                            $value = trim($parts[1]);
                        }
                    }
                } else {
                    // Two column format: datetime in A, value in B
                    $datetime = $worksheet->getCell('A' . $row)->getValue();
                    $value = $worksheet->getCell('B' . $row)->getValue();
                }

                if ($datetime && $value !== null && $value !== '') {
                    // Convert Excel date to PHP DateTime if needed
                    if (is_numeric($datetime)) {
                        $datetime = Date::excelToDateTimeObject($datetime);
                    } else {
                        $datetime = new DateTime($datetime, new DateTimeZone("Asia/Muscat"));
                    }
                    TemperatureLog::create([
                        'device_id' => $device->id,
                        'value' => (float)$value,
                        'timestamp' => $datetime->getTimestamp(),
                    ]);
                }
            }

            // Dispatch event to notify external server about the end (multiple requests)
            event(new CollectRequestUpdated($requestIds, 'ended'));

            // Update each collect request individually to add ending location and temperature logs
            foreach ($requestIds as $requestId) {
                $request = $this->collectRequestRepository->findById($requestId);

                if (!$request) {
                    continue;
                }

                // Prepare update data
                $updateData = [
                    'device_id' => $device->id,
                    'ended_at' => now(),
                    'status' => 'received',
                ];

                // Prepare extra_information
                $extraInfo = is_array($request->extra_information) ? $request->extra_information : [];

                // Add ending location to extra_information if provided
                if ($endingLocation && is_array($endingLocation)) {
                    $extraInfo['ending_location'] = [
                        'latitude' => $endingLocation['latitude'],
                        'longitude' => $endingLocation['longitude'],
                        'accuracy' => $endingLocation['accuracy'] ?? null,
                        'timestamp' => now()->toDateTimeString(),
                    ];
                }

                // Get temperature logs for this collect request (between started_at and ended_at)
                if ($request->started_at && $device->id) {
                    $temperatureLogs = TemperatureLog::where('device_id', $device->id)
                        ->whereBetween('timestamp', [$request->started_at, now()])
                        ->orderBy('timestamp', 'asc')
                        ->get()
                        ->map(function ($log) {
                            return [
                                'value' => $log->value,
                                'timestamp' => $log->timestamp->toIso8601String(),
                            ];
                        })
                        ->toArray();

                    // Add temperature logs to extra_information
                    $extraInfo['temperature_logs'] = $temperatureLogs;
                }

                $updateData['extra_information'] = $extraInfo;

                $this->collectRequestRepository->update($requestId, $updateData);
            }

            DB::commit();

            return [
                'success' => true,
                'device' => $device,
                'temperature_logs_count' => $highestRow - $dataStartRow + 1,
            ];

        } catch (Exception $e) {
            DB::rollBack();

            // Delete uploaded file if transaction failed
            if (isset($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            throw $e;
        }
    }

    /**
     * @input Worksheet $worksheet
     * @output
     * @throws Exception
     */
    private function getMacAddress(Worksheet $worksheet): string
    {
        // First, check row 1 for "MAC Address" format
        $firstRowValue = $worksheet->getCell('A1')->getValue();
        if ($firstRowValue && preg_match('/MAC\s*Address[\s:]*([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/i', $firstRowValue, $matches)) {
            return $matches[0];
        }

        // If not found in A1, search in the first few rows
        $highestColumn = $worksheet->getHighestColumn();
        $dataArray = $worksheet->rangeToArray(
            'A1:' . $highestColumn . '1',
            null,
            true,
            false,
            false
        );

        // Flatten the 2D array
        $flatArray = array_merge(...$dataArray);

        // Use array_reduce to find first matching MAC address
        $macAddress = array_reduce($flatArray, function ($carry, $value) {
            // If already found, return it
            if ($carry !== null) {
                return $carry;
            }

            if (empty($value)) {
                return null;
            }

            // Check for "MAC address: XX:XX:XX:XX:XX:XX" or "MAC Address	XX:XX:XX:XX:XX:XX" format
            if (preg_match('/MAC\s*Address[\s:]*([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/i', $value, $matches)) {
                // Extract just the MAC address part
                if (preg_match('/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/', $matches[0], $macMatches)) {
                    return $macMatches[0];
                }
            }

            // Check for "MAC address()" format
            if (preg_match('/MAC address\((.*?)\)/', $value, $matches)) {
                return $matches[1];
            }

            // Check for plain MAC address format
            if (preg_match('/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/', $value)) {
                return $value;
            }

            return null;
        }, null);

        if (!$macAddress) {
            throw new Exception('No MAC address found in worksheet');
        }

        return $macAddress;
    }
}
