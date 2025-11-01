<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CollectRequest;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return response()->json([
                'totalUsers' => User::count(),
                'totalRequests' => CollectRequest::count(),
                'activeCollections' => CollectRequest::whereNotNull('started_at')
                    ->whereNull('ended_at')
                    ->count(),
            ]);
        }

        // Operator stats
        return response()->json([
            'myCollections' => CollectRequest::where('user_id', $user->id)->count(),
            'completedToday' => CollectRequest::where('user_id', $user->id)
                ->whereDate('ended_at', today())
                ->count(),
            'pending' => CollectRequest::where('user_id', $user->id)
                ->whereNull('started_at')
                ->count(),
        ]);
    }
}
