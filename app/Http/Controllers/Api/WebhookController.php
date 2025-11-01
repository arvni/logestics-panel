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
     * Expects user_id and referrer_id as server_ids from external system
     * Maps them to local User and Referrer records and creates a CollectRequest
     */
    public function handleLogisticsRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required',
            'sample_collector_id' => 'required|string',
            'referrer_id' => 'required|string',
            'extra_information' => 'nullable|array',
        ]);

        // Find user by server_id
        $user = User::where('server_id', $validated['sample_collector_id'])->first();
        if (!$user) {
            return response()->json([
                'error' => 'User not found',
                'message' => "No user found with server_id: {$validated['sample_collector_id']}"
            ], 404);
        }

        // Find referrer by server_id
        $referrer = Referrer::where('server_id', $validated['referrer_id'])->first();
        if (!$referrer) {
            return response()->json([
                'error' => 'Referrer not found',
                'message' => "No referrer found with server_id: {$validated['referrer_id']}"
            ], 404);
        }

        // Create collect request with mapped local IDs
        $collectRequest = CollectRequest::create([
            'user_id' => $user->id,
            'referrer_id' => $referrer->id,
            'server_id' => $validated['id'] ?? null,
            'extra_information' => $validated['extra_information'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Collect request created successfully',
            'data' => [
                'collect_request_id' => $collectRequest->id,
                'user_id' => $user->id,
                'referrer_id' => $referrer->id,
            ]
        ], 204);
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
}
