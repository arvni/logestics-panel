<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception thrown by API service when communication with external server fails
 */
class ApiServiceException extends Exception
{
    /**
     * Create a new ApiServiceException instance
     *
     * @param string $message The exception message
     * @param int $code The exception code (usually HTTP status code)
     * @param Exception|null $previous The previous exception
     */
    public function __construct(string $message = "", int $code = 0, Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
