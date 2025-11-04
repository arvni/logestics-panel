<?php

namespace App\Application\Operator;

use App\Domain\CollectRequest\CollectRequestRepositoryInterface;
use App\Events\CollectRequestUpdated;
use App\Models\CollectRequest;
use App\Models\Device;
use App\Models\TemperatureLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Reader\Csv;

class CollectRequestOperationService
{
    public function __construct(
        private readonly CollectRequestRepositoryInterface $collectRequestRepository
    ) {}

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

    public function startCollection(int $userId, int $requestId, array $data): CollectRequest
    {
        $request = $this->collectRequestRepository->findById($requestId);

        if (!$request) {
            throw new \Exception('Collect request not found');
        }

        if ($request->user_id !== $userId) {
            throw new \Exception('This request is not assigned to you');
        }

        if ($request->started_at) {
            throw new \Exception('This request has already been started');
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
            $reader->setDelimiter(','); // Ensure comma delimiter
            $reader->setInputEncoding('UTF-8'); // Specify encoding
            $spreadsheet = $reader->load($uploadedFile->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();

            // Log all cells in the first row for debugging
            $firstRow = $worksheet->rangeToArray('A1:D1', null, true, true, true)[1];
            Log::info('First row cells:', $firstRow);

            // Get MAC address from D1
            $macAddress = $worksheet->getCell('D1')->getValue();

            // Clean up MAC address if it has "MAC address()" prefix
            if (preg_match('/MAC address\((.*?)\)/', $macAddress, $matches)) {
                $macAddress = $matches[1]; // Extract 49:24:06:18:06:AD
            }

            // Validate MAC address format
            if (!preg_match('/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/', $macAddress)) {
                throw new \Exception('MAC address not found in cell D1');
            }

            // Find or create device
            $device = Device::firstOrCreate(['mac' => $macAddress]);

            // Parse temperature data (starting from row 2, skip header)
            $highestRow = $worksheet->getHighestRow();

            for ($row = 2; $row <= $highestRow; $row++) {
                $datetime = $worksheet->getCell('A' . $row)->getValue();
                $value = $worksheet->getCell('B' . $row)->getValue();

                if ($datetime && $value !== null && $value !== '') {
                    // Convert Excel date to PHP DateTime if needed
                    if (is_numeric($datetime)) {
                        $datetime = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($datetime);
                    } else {
                        $datetime = new \DateTime($datetime);
                    }

                    TemperatureLog::create([
                        'device_id' => $device->id,
                        'value' => $value,
                        'timestamp' => $datetime,
                    ]);
                }
            }

            // Dispatch event to notify external server about the end (multiple requests)
            event(new CollectRequestUpdated($requestIds, 'ended'));

            // Update each collect request individually to add ending location
            foreach ($requestIds as $requestId) {
                $request = $this->collectRequestRepository->findById($requestId);

                if (!$request) {
                    continue;
                }

                // Prepare update data
                $updateData = [
                    'device_id' => $device->id,
                    'ended_at' => now(),
                ];

                // Add ending location to extra_information if provided
                if ($endingLocation && is_array($endingLocation)) {
                    $extraInfo = is_array($request->extra_information) ? $request->extra_information : [];

                    $extraInfo['ending_location'] = [
                        'latitude' => $endingLocation['latitude'],
                        'longitude' => $endingLocation['longitude'],
                        'accuracy' => $endingLocation['accuracy'] ?? null,
                        'timestamp' => now()->toDateTimeString(),
                    ];

                    $updateData['extra_information'] = $extraInfo;
                }

                $this->collectRequestRepository->update($requestId, $updateData);
            }

            DB::commit();

            return [
                'success' => true,
                'device' => $device,
                'temperature_logs_count' => $highestRow - 1,
            ];

        } catch (\Exception $e) {
            DB::rollBack();

            // Delete uploaded file if transaction failed
            if (isset($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            throw $e;
        }
    }
}
