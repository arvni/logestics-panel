<?php

namespace App\Infrastructure\Repositories;

use App\Domain\CollectRequest\CollectRequestRepositoryInterface;
use App\Models\CollectRequest;
use Illuminate\Support\Collection;

class CollectRequestRepository implements CollectRequestRepositoryInterface
{
    public function findById(int $id): ?CollectRequest
    {
        return CollectRequest::with(['user', 'referrer', 'device'])->find($id);
    }

    public function findByUserId(int $userId): Collection
    {
        return CollectRequest::where('user_id', $userId)
            ->with(['referrer', 'device'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findAll(): Collection
    {
        return CollectRequest::with(['user', 'referrer', 'device'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findStartedRequests(): Collection
    {
        return CollectRequest::whereNotNull('started_at')
            ->whereNull('ended_at')
            ->with(['user', 'referrer', 'device'])
            ->get();
    }

    public function create(array $data): CollectRequest
    {
        return CollectRequest::create($data);
    }

    public function update(int $id, array $data): CollectRequest
    {
        $request = CollectRequest::findOrFail($id);
        $request->update($data);
        return $request->fresh(['user', 'referrer', 'device']);
    }

    public function assignToUser(int $requestId, int $userId): bool
    {
        $request = CollectRequest::findOrFail($requestId);
        $request->user_id = $userId;
        return $request->save();
    }

    public function endMultiple(array $requestIds, array $data): bool
    {
        return CollectRequest::whereIn('id', $requestIds)->update($data) > 0;
    }

    public function delete(int $id): bool
    {
        $request = CollectRequest::findOrFail($id);
        return $request->delete();
    }
}
