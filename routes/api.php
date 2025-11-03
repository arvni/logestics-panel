<?php


use App\Http\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

Route::middleware(['webhook.verify'])->group(function () {
    Route::post('/webhook/logistics-request', [WebhookController::class, 'handleLogisticsRequest']);
    Route::post('/webhook/collect-request-update', [WebhookController::class, 'handleCollectRequestUpdate']);
    Route::post('/webhook/referrer', [WebhookController::class, 'handleReferrer']);
    Route::post('/webhook/user', [WebhookController::class, 'handleUser']);
});
