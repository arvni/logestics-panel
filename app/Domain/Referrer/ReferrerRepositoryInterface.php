<?php

namespace App\Domain\Referrer;

use App\Models\Referrer;
use Illuminate\Support\Collection;

interface ReferrerRepositoryInterface
{
    public function findById(int $id): ?Referrer;

    public function findAll(): Collection;

    public function create(array $data): Referrer;

    public function update(int $id, array $data): Referrer;

    public function delete(int $id): bool;
}
