<?php

namespace App\Providers;

use App\Domain\CollectRequest\CollectRequestRepositoryInterface;
use App\Domain\Referrer\ReferrerRepositoryInterface;
use App\Infrastructure\Repositories\CollectRequestRepository;
use App\Infrastructure\Repositories\ReferrerRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            ReferrerRepositoryInterface::class,
            ReferrerRepository::class
        );

        $this->app->bind(
            CollectRequestRepositoryInterface::class,
            CollectRequestRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}
