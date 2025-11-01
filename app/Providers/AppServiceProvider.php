<?php

namespace App\Providers;

use App\Events\CollectRequestEnded;
use App\Listeners\SendCollectRequestToServer;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
//        if (config('app.env') !== 'local') {
            URL::forceScheme('https');
//        }

        // Register event listeners
        Event::listen(
            CollectRequestEnded::class,
            SendCollectRequestToServer::class,
        );
    }
}
