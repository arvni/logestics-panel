<?php

namespace App\Http\Controllers\Api\Operator;

use App\Application\Operator\CollectRequestOperationService;
use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;

class CollectRequestController extends Controller
{
    public function __construct(
        private readonly CollectRequestOperationService $operationService
    )
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'referrer_id', 'status', 'per_page']);
        $requests = $this->operationService->getAssignedRequests($request->user()->id, $filters);
        return response()->json($requests);
    }

    public function show(Request $request, string $id)
    {
        $collectRequest = $this->operationService->getCollectRequestDetails($request->user()->id, $id);

        if (!$collectRequest) {
            return response()->json(['message' => 'Collection request not found'], 404);
        }

        return response()->json($collectRequest);
    }

    public function start(Request $request)
    {
        $validated = $request->validate([
            'request_id' => 'required|exists:collect_requests,id',
            'server_id' => 'nullable|string',
            'barcodes' => 'required|array|min:1',
            'barcodes.*' => 'required|string',
            'starting_location' => 'nullable|array',
            'starting_location.latitude' => 'required_with:starting_location|numeric|between:-90,90',
            'starting_location.longitude' => 'required_with:starting_location|numeric|between:-180,180',
            'starting_location.accuracy' => 'nullable|numeric|min:0',
        ]);

        try {
            $collectRequest = $this->operationService->startCollection(
                $request->user()->id,
                $validated['request_id'],
                $validated
            );

            return response()->json($collectRequest);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function end(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimetypes:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,application/octet-stream,text/plain',
            'collect_request_ids' => 'required|array',
            'collect_request_ids.*' => 'integer|exists:collect_requests,id',
            'ending_location' => 'nullable|array',
            'ending_location.latitude' => 'required_with:ending_location|numeric|between:-90,90',
            'ending_location.longitude' => 'required_with:ending_location|numeric|between:-180,180',
            'ending_location.accuracy' => 'nullable|numeric|min:0',
        ]);

        try {

            $result = $this->operationService
                ->endCollections(
                $request->user()->id,
                $validated['collect_request_ids'],
                $request->file('file'),
                $validated['ending_location'] ?? null
            );

            return response()->json($result);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to process file',
                'error' => $e->getMessage(),
            ], 422);
        }
    }
}
