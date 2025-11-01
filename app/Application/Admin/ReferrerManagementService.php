<?php

namespace App\Application\Admin;

use App\Domain\Referrer\ReferrerRepositoryInterface;
use App\Models\Referrer;
use Illuminate\Support\Collection;

class ReferrerManagementService
{
    public function __construct(
        private readonly ReferrerRepositoryInterface $referrerRepository
    ) {}

    public function getAllReferrers(): Collection
    {
        return $this->referrerRepository->findAll();
    }

    public function getReferrerById(int $id): ?Referrer
    {
        return $this->referrerRepository->findById($id);
    }

    public function createReferrer(array $data): Referrer
    {
        return $this->referrerRepository->create([
            'name' => $data['name'],
            'address' => $data['address'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
        ]);
    }

    public function updateReferrer(int $id, array $data): Referrer
    {
        return $this->referrerRepository->update($id, [
            'name' => $data['name'] ?? null,
            'address' => $data['address'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
        ]);
    }

    public function deleteReferrer(int $id): bool
    {
        return $this->referrerRepository->delete($id);
    }
}
