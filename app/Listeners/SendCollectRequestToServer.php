<?php

namespace App\Listeners;

use App\Events\CollectRequestEnded;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendCollectRequestToServer implements ShouldQueue
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
     * Sends the collect request data to the external server webhook
     * with HMAC-SHA256 signature for verification
     * @throws ConnectionException
     */
    public function handle(CollectRequestEnded $event): void
    {
        $collectRequests = $event->collectRequests;

        // Get webhook endpoint and secret from config
        $webhookUrl = config('app.server_webhook_url');
        $webhookSecret = config('app.webhook_secret');

        // Skip if webhook URL is not configured
        if (empty($webhookUrl)) {
            Log::warning('Server webhook URL not configured. Skipping webhook for collect request.', $collectRequests);
            return;
        }

        if (empty($webhookSecret)) {
            Log::warning('Webhook secret not configured. Skipping webhook for collect request.', $collectRequests);
            return;
        }

        // Prepare payload with server IDs
        $payload = $collectRequests->map(function ($collectRequest) {
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
        });
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
                Log::info('Successfully sent collect request to server webhook.', [
                    'collect_request_id' => $collectRequest->id,
                    'server_id' => $collectRequest->server_id,
                    'status_code' => $response->status(),
                ]);
            } else {
                Log::error('Failed to send collect request to server webhook.', [
                    'collect_request_id' => $collectRequest->id,
                    'server_id' => $collectRequest->server_id,
                    'status_code' => $response->status(),
                    'response_body' => $response->body(),
                ]);
            }
        } catch (Exception $e) {
            Log::error('Exception while sending collect request to server webhook.', [
                'collect_request_id' => $collectRequest->id,
                'server_id' => $collectRequest->server_id,
                'error' => $e->getMessage(),
            ]);

            // Re-throw the exception so the job can be retried
            throw $e;
        }
    }
}
