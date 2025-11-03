<?php

namespace App\Listeners;

use App\Events\CollectRequestUpdated;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Listener that notifies the external server when collect requests are updated
 *
 * This listener sends webhook notifications to the external server when:
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
     * Sends the collect request update data to the external server webhook
     * with HMAC-SHA256 signature for verification
     * @throws ConnectionException
     */
    public function handle(CollectRequestUpdated $event): void
    {
        $collectRequests = $event->collectRequests;
        $action = $event->action; // 'started' or 'ended'

        // Get webhook endpoint and secret from config
        $webhookUrl = config('app.server_webhook_url');
        $webhookSecret = config('app.webhook_secret');

        // Skip if webhook URL is not configured
        if (empty($webhookUrl)) {
            Log::warning('Server webhook URL not configured. Skipping webhook for collect request.', [
                'action' => $action,
                'collect_request_ids' => $collectRequests->pluck('id')->toArray(),
            ]);
            return;
        }

        if (empty($webhookSecret)) {
            Log::warning('Webhook secret not configured. Skipping webhook for collect request.', [
                'action' => $action,
                'collect_request_ids' => $collectRequests->pluck('id')->toArray(),
            ]);
            return;
        }

        // Prepare payload with server IDs and action
        $payload = [
            'action' => $action,
            'collect_requests' => $collectRequests->map(function ($collectRequest) {
                return [
                    'id' => $collectRequest->server_id,
                    'sample_collector_id' => $collectRequest->user->server_id,
                    'referrer_id' => $collectRequest->referrer->server_id,
                    'device_mac' => $collectRequest->device?->mac,
                    'started_at' => $collectRequest->started_at?->toIso8601String(),
                    'ended_at' => $collectRequest->ended_at?->toIso8601String(),
                    'barcodes' => $collectRequest->barcodes,
                    'extra_information' => $collectRequest->extra_information,
                ];
            })->toArray(),
        ];

        // Convert payload to JSON
        $payloadJson = json_encode($payload);

        // Generate HMAC-SHA256 signature
        $signature = hash_hmac('sha256', $payloadJson, $webhookSecret);

        try {
            // Send webhook request with signature
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-Webhook-Signature' => $signature,
            ])->post($webhookUrl, $payload);

            if ($response->successful()) {
                Log::info('Successfully sent collect request update to server webhook.', [
                    'action' => $action,
                    'collect_request_ids' => $collectRequests->pluck('id')->toArray(),
                    'server_ids' => $collectRequests->pluck('server_id')->toArray(),
                    'status_code' => $response->status(),
                ]);
            } else {
                Log::error('Failed to send collect request update to server webhook.', [
                    'action' => $action,
                    'collect_request_ids' => $collectRequests->pluck('id')->toArray(),
                    'server_ids' => $collectRequests->pluck('server_id')->toArray(),
                    'status_code' => $response->status(),
                    'response_body' => $response->body(),
                ]);
            }
        } catch (Exception $e) {
            Log::error('Exception while sending collect request update to server webhook.', [
                'action' => $action,
                'collect_request_ids' => $collectRequests->pluck('id')->toArray(),
                'error' => $e->getMessage(),
            ]);

            // Re-throw the exception so the job can be retried
            throw $e;
        }
    }
}
