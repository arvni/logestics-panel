<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Referrer\ReferrerRepositoryInterface;
use App\Models\Referrer;
use Illuminate\Support\Collection;

class ReferrerRepository implements ReferrerRepositoryInterface
{
    public function findById(int $id): ?Referrer
    {
        return Referrer::find($id);
    }

    public function findAll(): Collection
    {
        return Referrer::orderBy('name')->get();
    }

    public function create(array $data): Referrer
    {
        return Referrer::create($data);
    }

    public function update(int $id, array $data): Referrer
    {
        $referrer = Referrer::findOrFail($id);
        $referrer->update($data);
        return $referrer->fresh();
    }

    public function delete(int $id): bool
    {
        $referrer = Referrer::findOrFail($id);
        return $referrer->delete();
    }
}
