<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhookSignature
{
    /**
     * Handle an incoming request.
     *
     * Verifies the webhook signature using HMAC-SHA256
     * Expects the signature in the X-Webhook-Signature header
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('app.webhook_secret');

        // If no secret is configured, reject the request
        if (empty($secret)) {
            return response()->json([
                'error' => 'Webhook configuration error',
                'message' => 'Webhook secret not configured'
            ], 500);
        }

        // Get the signature from the request header
        $signature = $request->header('X-Webhook-Signature');

        if (empty($signature)) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Missing webhook signature'
            ], 401);
        }

        // Get the raw request body
        $payload = $request->getContent();

        // Compute the expected signature
        $expectedSignature = hash_hmac('sha256', $payload, $secret);

        // Use hash_equals to prevent timing attacks
        if (!hash_equals($expectedSignature, $signature)) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Invalid webhook signature'
            ], 401);
        }

        // Signature is valid, proceed with the request
        return $next($request);
    }
}
