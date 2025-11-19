<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\Admin\CollectRequestAssignmentController;
use App\Http\Controllers\Api\Admin\ReferrerController as AdminReferrerController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Operator\CollectRequestController as OperatorCollectRequestController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('MuiWelcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('MuiDashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // CSRF token endpoint for PWA
    Route::get('/csrf-token', function () {
        return response()->json(['csrf_token' => csrf_token()]);
    })->name('csrf.token');

    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        Route::get('/users', function () {
            return Inertia::render('Admin/Users/Index');
        })->name('admin.users.index');

        Route::get('/referrers', function () {
            return Inertia::render('Admin/Referrers/Index');
        })->name('admin.referrers.index');

        Route::get('/collect-requests', function () {
            return Inertia::render('Admin/CollectRequests/Index');
        })->name('admin.collect-requests.index');
    });

    // Operator routes
    Route::middleware(['role:operator'])->group(function () {
        Route::get('/collect-requests', function () {
            return Inertia::render('CollectRequests/Index');
        })->name('collect-requests.index');

        Route::get('/collect-requests/{id}', function ($id) {
            return Inertia::render('CollectRequests/Show', ['id' => $id]);
        })->name('collect-requests.show');
    });

    // API routes - moved from api.php to use web session authentication
    Route::prefix('api')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

// Admin API routes
        Route::middleware(['role:admin'])->prefix('admin')->group(function () {
            // User management
            Route::apiResource('users', AdminUserController::class);

            // Referrer management
            Route::apiResource('referrers', AdminReferrerController::class);

            // Collect Request assignment
            Route::get('/collect-requests', [CollectRequestAssignmentController::class, 'index']);
            Route::get('/operators', [CollectRequestAssignmentController::class, 'getOperators']);
            Route::post('/collect-requests', [CollectRequestAssignmentController::class, 'store']);
            Route::post('/collect-requests/assign', [CollectRequestAssignmentController::class, 'assign']);
            Route::delete('/collect-requests/{id}', [CollectRequestAssignmentController::class, 'destroy']);
        });

// Operator API routes
        Route::middleware(['role:operator'])->prefix('operator')->group(function () {
            Route::get('/collect-requests', [OperatorCollectRequestController::class, 'index']);
            Route::get('/collect-requests/{id}', [OperatorCollectRequestController::class, 'show']);
            Route::post('/collect-requests/select', [OperatorCollectRequestController::class, 'select']);
            Route::post('/collect-requests/cancel', [OperatorCollectRequestController::class, 'cancelSelection']);
            Route::post('/collect-requests/start', [OperatorCollectRequestController::class, 'start']);
            Route::post('/collect-requests/end', [OperatorCollectRequestController::class, 'end']);
            Route::get('/referrers', [AdminReferrerController::class, 'index']);
        });


    });
});

require __DIR__.'/auth.php';
