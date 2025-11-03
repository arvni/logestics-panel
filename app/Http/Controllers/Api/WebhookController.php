<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CollectRequest;
use App\Models\Referrer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class WebhookController extends Controller
{
    /**
     * Handle incoming logistics request webhook
     *
     * Expects sample_collector and referrer with their server IDs
     * Maps them to local User and Referrer records and creates a CollectRequest
     */
    public function handleLogisticsRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|integer',
            'action' => 'required|string|in:create,update,delete',
            'status' => 'required|string|in:pending,in_progress,completed,cancelled',
            'sample_collector' => 'required|array',
            'sample_collector.id' => 'required|integer',
            'sample_collector.name' => 'required|string',
            'sample_collector.email' => 'required|email',
            'referrer' => 'required|array',
            'referrer.id' => 'required|integer',
            'referrer.name' => 'required|string',
            'referrer.email' => 'required|email',
            'referrer.phone' => 'nullable|string',
            'logistic_information' => 'nullable|array',
            'created_at' => 'nullable|string',
            'updated_at' => 'nullable|string',
        ]);

        // Find or create sample collector (user) by server_id
        $user = User::where('server_id', $validated['sample_collector']['id'])->first();
        if (!$user) {
            // Auto-create user if not exists
            $user = User::create([
                'server_id' => $validated['sample_collector']['id'],
                'name' => $validated['sample_collector']['name'],
                'email' => $validated['sample_collector']['email'],
                'password' => Str::random(32), // Random password, user must reset to login
                'role' => 'operator', // Default role for sample collectors
            ]);
        }

        // Find or create referrer by server_id
        $referrer = Referrer::where('server_id', $validated['referrer']['id'])->first();
        if (!$referrer) {
            // Auto-create referrer if not exists
            $referrer = Referrer::create([
                'server_id' => $validated['referrer']['id'],
                'name' => $validated['referrer']['name'],
            ]);
        }

        // Check if collect request already exists based on server_id
        $collectRequest = CollectRequest::where('server_id', $validated['id'])->first();

        if ($validated['action'] === 'create' && !$collectRequest) {
            // Create new collect request
            $collectRequest = CollectRequest::create([
                'user_id' => $user->id,
                'referrer_id' => $referrer->id,
                'server_id' => $validated['id'],
                'status' => $validated['status'],
                'extra_information' => $validated['logistic_information'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Collect request created successfully',
                'data' => [
                    'collect_request_id' => $collectRequest->id,
                    'server_id' => $collectRequest->server_id,
                    'user_id' => $user->id,
                    'referrer_id' => $referrer->id,
                    'status' => $collectRequest->status,
                ]
            ], 201);
        } elseif ($validated['action'] === 'update' && $collectRequest) {
            // Update existing collect request
            $collectRequest->update([
                'status' => $validated['status'],
                'extra_information' => $validated['logistic_information'] ?? $collectRequest->extra_information,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Collect request updated successfully',
                'data' => [
                    'collect_request_id' => $collectRequest->id,
                    'server_id' => $collectRequest->server_id,
                    'status' => $collectRequest->status,
                ]
            ], 200);
        } elseif ($validated['action'] === 'delete' && $collectRequest) {
            $collectRequest->delete();

            return response()->json([
                'success' => true,
                'message' => 'Collect request cancelled successfully',
            ], 204);
        } else {
            return response()->json([
                'error' => 'Invalid action or request state',
                'message' => "Cannot perform action '{$validated['action']}' on collect request with server_id: {$validated['id']}"
            ], 400);
        }
    }

    /**
     * Handle incoming referrer data webhook
     *
     * Creates or updates a referrer based on server_id from external system
     */
    public function handleReferrer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        // Create or update referrer based on server_id
        $referrer = Referrer::updateOrCreate(
            ['server_id' => $validated['id']],
            [
                'name' => $validated['name'],
                'address' => $validated['address'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => $referrer->wasRecentlyCreated ? 'Referrer created successfully' : 'Referrer updated successfully',
            'data' => [
                'referrer_id' => $referrer->id,
                'server_id' => $referrer->server_id,
                'name' => $referrer->name,
                'was_created' => $referrer->wasRecentlyCreated,
            ]
        ], $referrer->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Handle incoming user data webhook
     *
     * Creates or updates a user based on server_id from external system
     * Generates a random password for new users (they'll need to reset it to login)
     */
    public function handleUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ]);

        // Check if user exists by server_id
        $user = User::where('server_id', $validated['id'])->first();

        if ($user) {
            // Update existing user
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);
            $wasCreated = false;
        } else {
            // Create new user with random password
            $user = User::create([
                'server_id' => $validated['id'],
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Str::random(32), // Random password, user must reset to login
            ]);
            $wasCreated = true;
        }

        return response()->json([
            'success' => true,
            'message' => $wasCreated ? 'User created successfully' : 'User updated successfully',
            'data' => [
                'user_id' => $user->id,
                'server_id' => $user->server_id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'was_created' => $wasCreated,
            ]
        ], $wasCreated ? 201 : 200);
    }

    /**
     * Handle collect request updates webhook (started/ended actions)
     *
     * Receives notifications when collect requests are started or ended
     * Supports multiple collect requests in a single webhook call
     *
     * Expected payload:
     * {
     *   "action": "started" | "ended",
     *   "collect_requests": [
     *     {
     *       "id": <server_id>,
     *       "sample_collector_id": <server_id>,
     *       "referrer_id": <server_id>,
     *       "device_mac": "...",
     *       "started_at": "2025-11-03T10:30:00Z",
     *       "ended_at": "2025-11-03T12:45:00Z",
     *       "barcodes": ["..."],
     *       "extra_information": {...}
     *     }
     *   ]
     * }
     */
    public function handleCollectRequestUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|string|in:started,ended',
            'collect_requests' => 'required|array|min:1',
            'collect_requests.*.id' => 'required|integer',
            'collect_requests.*.sample_collector_id' => 'required|integer',
            'collect_requests.*.referrer_id' => 'required|integer',
            'collect_requests.*.device_mac' => 'nullable|string',
            'collect_requests.*.started_at' => 'nullable|string',
            'collect_requests.*.ended_at' => 'nullable|string',
            'collect_requests.*.barcodes' => 'nullable|array',
            'collect_requests.*.extra_information' => 'nullable|array',
        ]);

        $action = $validated['action'];
        $results = [];

        foreach ($validated['collect_requests'] as $collectRequestData) {
            // Find the collect request by server_id
            $collectRequest = CollectRequest::where('server_id', $collectRequestData['id'])->first();

            if (!$collectRequest) {
                $results[] = [
                    'server_id' => $collectRequestData['id'],
                    'success' => false,
                    'message' => 'Collect request not found',
                ];
                continue;
            }

            // Update based on action
            if ($action === 'started') {
                $collectRequest->update([
                    'started_at' => $collectRequestData['started_at'] ? \Carbon\Carbon::parse($collectRequestData['started_at']) : null,
                    'barcodes' => $collectRequestData['barcodes'] ?? $collectRequest->barcodes,
                    'extra_information' => $collectRequestData['extra_information'] ?? $collectRequest->extra_information,
                    'status' => 'in_progress',
                ]);

                $results[] = [
                    'server_id' => $collectRequestData['id'],
                    'local_id' => $collectRequest->id,
                    'success' => true,
                    'message' => 'Collect request marked as started',
                ];
            } elseif ($action === 'ended') {
                $updateData = [
                    'ended_at' => $collectRequestData['ended_at'] ? \Carbon\Carbon::parse($collectRequestData['ended_at']) : now(),
                    'extra_information' => $collectRequestData['extra_information'] ?? $collectRequest->extra_information,
                    'status' => 'completed',
                ];

                // Update device if MAC address is provided
                if (!empty($collectRequestData['device_mac'])) {
                    $device = \App\Models\Device::firstOrCreate(['mac' => $collectRequestData['device_mac']]);
                    $updateData['device_id'] = $device->id;
                }

                $collectRequest->update($updateData);

                $results[] = [
                    'server_id' => $collectRequestData['id'],
                    'local_id' => $collectRequest->id,
                    'success' => true,
                    'message' => 'Collect request marked as ended',
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Processed {$action} action for " . count($validated['collect_requests']) . ' collect request(s)',
            'results' => $results,
        ], 200);
    }
}
