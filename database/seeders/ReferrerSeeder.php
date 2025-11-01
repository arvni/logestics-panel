<?php

namespace Database\Seeders;

use App\Models\Referrer;
use Illuminate\Database\Seeder;

class ReferrerSeeder extends Seeder
{
    public function run(): void
    {
        $referrers = [
            [
                'name' => 'Main Warehouse',
                'address' => '123 Industrial Ave, City, State 12345',
                'latitude' => 40.7128,
                'longitude' => -74.0060,
            ],
            [
                'name' => 'Distribution Center North',
                'address' => '456 North Blvd, Northville, State 67890',
                'latitude' => 42.3314,
                'longitude' => -83.0458,
            ],
            [
                'name' => 'South Regional Office',
                'address' => '789 South Street, Southtown, State 11111',
                'latitude' => 33.7490,
                'longitude' => -84.3880,
            ],
            [
                'name' => 'East Coast Hub',
                'address' => '321 East Road, Eastville, State 22222',
                'latitude' => 39.9526,
                'longitude' => -75.1652,
            ],
            [
                'name' => 'West Coast Facility',
                'address' => '654 West Ave, Westburg, State 33333',
                'latitude' => 34.0522,
                'longitude' => -118.2437,
            ],
        ];

        foreach ($referrers as $referrer) {
            Referrer::create($referrer);
        }
    }
}
