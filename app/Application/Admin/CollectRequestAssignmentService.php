<?php

namespace App\Application\Admin;

use App\Domain\CollectRequest\CollectRequestRepositoryInterface;
use App\Models\CollectRequest;
use App\Models\User;
use Illuminate\Support\Collection;

class CollectRequestAssignmentService
{
    public function __construct(
        private readonly CollectRequestRepositoryInterface $collectRequestRepository
    ) {}

    public function getAllCollectRequests(): Collection
    {
        return $this->collectRequestRepository->findAll();
    }

    public function getAvailableOperators(): Collection
    {
        return User::where('role', 'operator')->get();
    }

    public function assignRequestToOperator(int $requestId, int $operatorId): bool
    {
        $operator = User::where('id', $operatorId)->where('role', 'operator')->firstOrFail();
        return $this->collectRequestRepository->assignToUser($requestId, $operator->id);
    }

    public function createCollectRequest(array $data): CollectRequest
    {
        return $this->collectRequestRepository->create([
            'user_id' => $data['user_id'],
            'referrer_id' => $data['referrer_id'] ?? null,
            'server_id' => $data['server_id'] ?? null,
            'barcodes' => $data['barcodes'] ?? [],
        ]);
    }

    public function deleteCollectRequest(int $id): bool
    {
        return $this->collectRequestRepository->delete($id);
    }
}
