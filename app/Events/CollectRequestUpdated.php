<?php

namespace App\Events;

use App\Models\CollectRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

/**
 * Event fired when collect requests are updated (selected, started, or ended)
 *
 * This event is dispatched when:
 * - A collect request is selected for collection by an operator
 * - A single collect request is started by an operator
 * - Multiple collect requests are ended by an operator
 */
class CollectRequestUpdated
{
    use Dispatchable, SerializesModels;

    public Collection $collectRequests;
    public string $action; // 'selected', 'started', or 'ended'

    /**
     * Create a new event instance.
     *
     * @param array $collectRequestsId Array of collect request IDs
     * @param string $action The action performed: 'selected', 'started', or 'ended'
     */
    public function __construct(
        array  $collectRequestsId,
        string $action = 'ended'
    )
    {
        // Load relationships to ensure they're available in the listener
        $this->collectRequests = CollectRequest::whereIn('id', $collectRequestsId)
            ->with(['user', 'referrer', 'device'])
            ->get();
        $this->action = $action;
    }
}
