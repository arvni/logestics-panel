<?php

namespace App\Listeners;

use App\Events\CollectRequestUpdated;
use App\Exceptions\ApiServiceException;
use App\Services\ApiService;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

/**
 * Listener that notifies the external server when collect requests are updated
 *
 * This listener sends authenticated API requests to the external server when:
 * - A collect request is started (single request)
 * - Collect requests are ended (multiple requests)
 */
class NotifyServerOfCollectRequestUpdate implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * Sends the collect request update data to the external server API
     * with bearer token authentication
     */
    public function handle(CollectRequestUpdated $event): void
    {
        $collectRequests = $event->collectRequests;
        $action = $event->action; // 'started' or 'ended'

        // Check if API is configured
        if (empty(config('api.server_url'))) {
            Log::warning('API server URL not configured. Skipping collect request update notification.', [
                'action' => $action,
                'collect_request_ids' => $collectRequests->pluck('id')->toArray(),
            ]);
            return;
        }

        // Prepare collect requests data
        $collectRequestsData = $collectRequests->map(function ($collectRequest) {
            $data = [
                'id' => $collectRequest->server_id,
                'sample_collector_id' => $collectRequest->user->server_id,
                'referrer_id' => $collectRequest->referrer->server_id,
                'device_mac' => $collectRequest->device?->mac,
                'status' => $collectRequest->status,
                'started_at' => $collectRequest->started_at?->toIso8601String(),
                'ended_at' => $collectRequest->ended_at?->toIso8601String(),
                'barcodes' => $collectRequest->barcodes,
                'extra_information' => $collectRequest->extra_information,
            ];
            return $data;
        })->toArray();

        try {
            // Send update to API using authenticated request
            ApiService::sendCollectRequestUpdate($action, $collectRequestsData);

            Log::info('Successfully sent collect request update to server API.', [
                'action' => $action,
                'collect_request_ids' => $collectRequests->pluck('id')->toArray(),
                'server_ids' => $collectRequests->pluck('server_id')->toArray(),
            ]);

        } catch (ApiServiceException $e) {
            Log::error('API service error while sending collect request update.', [
                'action' => $action,
                'collect_request_ids' => $collectRequests->pluck('id')->toArray(),
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
            ]);

            // Re-throw the exception so the job can be retried
            throw $e;

        } catch (Exception $e) {
            Log::error('Unexpected error while sending collect request update to server API.', [
                'action' => $action,
                'collect_request_ids' => $collectRequests->pluck('id')->toArray(),
                'error' => $e->getMessage(),
            ]);

            // Re-throw the exception so the job can be retried
            throw $e;
        }
    }
}
