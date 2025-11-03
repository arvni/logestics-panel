<?php

namespace App\Http\Controllers\Api;

use App\Events\CollectRequestUpdated;
use App\Http\Controllers\Controller;
use App\Models\CollectRequest;
use App\Models\Device;
use App\Models\TemperatureLog;
use DateTime;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class CollectRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $collectRequests = $request->user()
            ->collectRequests()
            ->with('device')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($collectRequests);
    }

    /**
     * Start a new collection (scan barcodes)
     */
    public function start(Request $request)
    {
        $validated = $request->validate([
            'barcodes' => 'required|array',
            'barcodes.*' => 'required|string',
            'server_id' => 'nullable|string',
        ]);

        $collectRequest = CollectRequest::create([
            'user_id' => $request->user()->id,
            'server_id' => $validated['server_id'] ?? null,
            'barcodes' => $validated['barcodes'],
            'started_at' => now(),
        ]);

        return response()->json($collectRequest, 201);
    }

    /**
     * End multiple collections (upload temperature data)
     */
    public function end(Request $request)
    {
        $validated = $request->validate([
            'collect_request_ids' => 'required|array',
            'collect_request_ids.*' => 'required|exists:collect_requests,id',
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        DB::beginTransaction();

        try {
            // Store the uploaded file
            $file = $request->file('file');
            $filePath = $file->store('temperature_logs', 'public');

            // Parse the file
            $spreadsheet = IOFactory::load($file->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();

            // Get MAC address from D1
            $macAddress = $worksheet->getCell('D1')->getValue();

            if (!$macAddress) {
                throw new Exception('MAC address not found in cell D1');
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
                        $datetime = Date::excelToDateTimeObject($datetime);
                    } else {
                        $datetime = new DateTime($datetime);
                    }

                    TemperatureLog::create([
                        'device_id' => $device->id,
                        'value' => $value,
                        'timestamp' => $datetime,
                    ]);
                }
            }

            // Update collect requests with device_id and ended_at
            $collectRequests = CollectRequest::whereIn('id', $validated['collect_request_ids'])
                ->where('user_id', $request->user()->id)
                ->get();

            foreach ($collectRequests as $collectRequest) {
                $collectRequest->update([
                    'device_id' => $device->id,
                    'ended_at' => now(),
                ]);

                // Dispatch event to notify external server
                event(new CollectRequestUpdated($validated['collect_request_ids'], 'ended'));
            }

            DB::commit();

            return response()->json([
                'message' => 'Collections ended successfully',
                'device' => $device,
                'temperature_logs_count' => $highestRow - 1,
            ]);

        } catch (Exception $e) {
            DB::rollBack();

            // Delete uploaded file if transaction failed
            if (isset($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            return response()->json([
                'message' => 'Failed to process file',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $collectRequest = $request->user()
            ->collectRequests()
            ->with(['device', 'referrer'])
            ->findOrFail($id);

        // If the collect request has ended, get temperature logs within the time range
        if ($collectRequest->ended_at && $collectRequest->device_id) {
            $temperatureLogs = TemperatureLog::where('device_id', $collectRequest->device_id)
                ->whereBetween('timestamp', [$collectRequest->started_at, $collectRequest->ended_at])
                ->orderBy('timestamp', 'asc')
                ->get();

            $collectRequest->temperature_logs = $temperatureLogs;
        }

        return response()->json($collectRequest);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $collectRequest = $request->user()
            ->collectRequests()
            ->findOrFail($id);

        $collectRequest->delete();

        return response()->json(['message' => 'Collection request deleted successfully']);
    }
}
