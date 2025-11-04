<?php

namespace App\Services;

use App\Exceptions\ApiServiceException;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service for authenticating and communicating with external API server
 */
class ApiService
{
    private const TOKEN_CACHE_KEY = 'api_service_token';
    private const TOKEN_EXPIRY_MINUTES = 55; // Refresh before 1 hour expiry
    private const REQUEST_TIMEOUT = 30; // seconds
    private const RETRY_DELAY_MS = 1000; // milliseconds

    /**
     * Get the API authentication token (cached or fetch new)
     *
     * @return string
     * @throws ApiServiceException
     */
    public static function getApiToken(): string
    {
        // Try to get token from cache
        $cachedToken = Cache::get(self::TOKEN_CACHE_KEY);
        if ($cachedToken) {
            try {
                return decrypt($cachedToken);
            } catch (Exception $e) {
                Log::warning("Failed to decrypt cached token, fetching new one", [
                    'error' => $e->getMessage()
                ]);
                self::clearTokenCache();
            }
        }

        // Fetch new token
        return self::fetchNewToken();
    }

    /**
     * Authenticate and fetch a new API token
     *
     * @return string
     * @throws ApiServiceException
     */
    private static function fetchNewToken(): string
    {
        try {
            $loginUrl = config('api.server_url') . config('api.login_path');
            $credentials = [
                'email' => config('api.email'),
                'password' => config('api.password')
            ];

            if (empty($credentials['email']) || empty($credentials['password'])) {
                throw new ApiServiceException("API credentials not configured", 500);
            }

            $response = Http::timeout(self::REQUEST_TIMEOUT)
                ->retry(2, self::RETRY_DELAY_MS)
                ->post($loginUrl, $credentials);

            if (!$response->successful()) {
                Log::error("API authentication failed", [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'url' => $loginUrl
                ]);

                throw new ApiServiceException(
                    "Authentication failed with status {$response->status()}",
                    $response->status()
                );
            }

            $token = $response->json('access_token');
            if (empty($token)) {
                throw new ApiServiceException("No access token received from API", 500);
            }

            // Cache the encrypted token
            Cache::put(
                self::TOKEN_CACHE_KEY,
                encrypt($token),
                now()->addMinutes(self::TOKEN_EXPIRY_MINUTES)
            );

            Log::info("Successfully fetched new API token");
            return $token;

        } catch (ApiServiceException $e) {
            throw $e;
        } catch (Exception $e) {
            Log::error("Token fetch failed", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw new ApiServiceException(
                "Failed to fetch API token: " . $e->getMessage(),
                500,
                $e
            );
        }
    }

    /**
     * Clear the cached token
     */
    private static function clearTokenCache(): void
    {
        Cache::forget(self::TOKEN_CACHE_KEY);
        Log::info("Cleared cached API token");
    }

    /**
     * Send collect request update to external API
     *
     * @param string $action 'started' or 'ended'
     * @param array $collectRequestsData Array of collect request data
     * @return array Response from API
     * @throws ApiServiceException
     */
    public static function sendCollectRequestUpdate(string $action, array $collectRequestsData): array
    {
        try {
            $token = self::getApiToken();
            $apiUrl = config('api.server_url') . config('api.collect_request_update_path');

            $payload = [
                'action' => $action,
                'collect_requests' => $collectRequestsData,
            ];

            $response = Http::timeout(self::REQUEST_TIMEOUT)
                ->retry(2, self::RETRY_DELAY_MS)
                ->withToken($token)
                ->post($apiUrl, $payload);

            if ($response->status() === 401) {
                // Token expired, clear cache and retry once
                Log::warning("API token expired, fetching new token and retrying");
                self::clearTokenCache();
                $token = self::getApiToken();

                $response = Http::timeout(self::REQUEST_TIMEOUT)
                    ->withToken($token)
                    ->post($apiUrl, $payload);
            }

            if (!$response->successful()) {
                Log::error("Failed to send collect request update to API", [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'url' => $apiUrl,
                    'action' => $action,
                    'collect_requests_count' => count($collectRequestsData),
                ]);

                throw new ApiServiceException(
                    "API request failed with status {$response->status()}",
                    $response->status()
                );
            }

            Log::info("Successfully sent collect request update to API", [
                'action' => $action,
                'collect_requests_count' => count($collectRequestsData),
                'status_code' => $response->status(),
            ]);

            return $response->json();

        } catch (ApiServiceException $e) {
            throw $e;
        } catch (Exception $e) {
            Log::error("Exception while sending collect request update to API", [
                'error' => $e->getMessage(),
                'action' => $action,
            ]);

            throw new ApiServiceException(
                "Failed to send collect request update: " . $e->getMessage(),
                500,
                $e
            );
        }
    }
}
