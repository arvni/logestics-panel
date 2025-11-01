<?php

namespace App\Domain\CollectRequest;

use App\Models\CollectRequest;
use Illuminate\Support\Collection;

interface CollectRequestRepositoryInterface
{
    public function findById(int $id): ?CollectRequest;

    public function findByUserId(int $userId): Collection;

    public function findAll(): Collection;

    public function findStartedRequests(): Collection;

    public function create(array $data): CollectRequest;

    public function update(int $id, array $data): CollectRequest;

    public function assignToUser(int $requestId, int $userId): bool;

    public function endMultiple(array $requestIds, array $data): bool;

    public function delete(int $id): bool;
}
