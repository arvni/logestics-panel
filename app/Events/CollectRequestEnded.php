<?php

namespace App\Events;

use App\Models\CollectRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class CollectRequestEnded
{
    use Dispatchable, SerializesModels;

    public Collection $collectRequests;

    /**
     * Create a new event instance.
     */
    public function __construct(
        array $collectRequestsId
    )
    {
        // Load relationships to ensure they're available in the listener
        $this->collectRequests = CollectRequest::whereIn('id', $collectRequestsId)->with(['user', 'referrer', 'device'])->get();
    }
}
