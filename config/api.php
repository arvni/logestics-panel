<?php

return [

    /*
    |--------------------------------------------------------------------------
    | External API Server Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for communicating with the external API server.
    | Used for sending collect request updates and other data.
    |
    */

    /**
     * Base URL of the external API server
     * Example: https://api.example.com
     */
    'server_url' => env('API_SERVER_URL', 'http://localhost:8002/api'),

    /**
     * Login endpoint path (relative to server_url)
     * The full URL will be: {server_url}{login_path}
     */
    'login_path' => env('API_LOGIN_PATH', '/login'),

    /**
     * Collect request update endpoint path (relative to server_url)
     * The full URL will be: {server_url}{collect_request_update_path}
     */
    'collect_request_update_path' => env('API_COLLECT_REQUEST_UPDATE_PATH', '/collect-request-update'),

    /**
     * Email for API authentication
     */
    'email' => env('API_EMAIL', ''),

    /**
     * Password for API authentication
     */
    'password' => env('API_PASSWORD', ''),

];
