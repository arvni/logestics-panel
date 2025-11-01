<?php

namespace App\Http\Controllers\Api\Admin;

use App\Application\Admin\CollectRequestAssignmentService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CollectRequestAssignmentController extends Controller
{
    public function __construct(
        private readonly CollectRequestAssignmentService $assignmentService
    ) {}

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $requests = \App\Models\CollectRequest::with(['user', 'referrer', 'device'])
            ->when($search, function ($query, $search) {
                $query->where('server_id', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->when($status === 'not_started', function ($query) {
                $query->whereNull('started_at');
            })
            ->when($status === 'in_progress', function ($query) {
                $query->whereNotNull('started_at')->whereNull('ended_at');
            })
            ->when($status === 'completed', function ($query) {
                $query->whereNotNull('ended_at');
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($requests);
    }

    public function getOperators()
    {
        $operators = $this->assignmentService->getAvailableOperators();
        return response()->json($operators);
    }

    public function assign(Request $request)
    {
        $validated = $request->validate([
            'request_id' => 'required|exists:collect_requests,id',
            'operator_id' => 'required|exists:users,id',
        ]);

        try {
            $this->assignmentService->assignRequestToOperator(
                $validated['request_id'],
                $validated['operator_id']
            );

            return response()->json(['message' => 'Request assigned successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'referrer_id' => 'nullable|exists:referrers,id',
            'server_id' => 'nullable|string',
            'barcodes' => 'nullable|array',
            'barcodes.*' => 'string',
        ]);

        $collectRequest = $this->assignmentService->createCollectRequest($validated);

        return response()->json($collectRequest, 201);
    }

    public function destroy(string $id)
    {
        try {
            $this->assignmentService->deleteCollectRequest($id);
            return response()->json(['message' => 'Collect request deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Collect request not found'], 404);
        }
    }
}
