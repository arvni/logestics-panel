<?php

namespace App\Http\Controllers\Api\Admin;

use App\Application\Admin\ReferrerManagementService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReferrerController extends Controller
{
    public function __construct(
        private readonly ReferrerManagementService $referrerService
    ) {}

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $referrers = \App\Models\Referrer::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate($perPage);

        return response()->json($referrers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $referrer = $this->referrerService->createReferrer($validated);

        return response()->json($referrer, 201);
    }

    public function show(string $id)
    {
        $referrer = $this->referrerService->getReferrerById($id);

        if (!$referrer) {
            return response()->json(['message' => 'Referrer not found'], 404);
        }

        return response()->json($referrer);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        try {
            $referrer = $this->referrerService->updateReferrer($id, $validated);
            return response()->json($referrer);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Referrer not found'], 404);
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->referrerService->deleteReferrer($id);
            return response()->json(['message' => 'Referrer deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Referrer not found'], 404);
        }
    }
}
