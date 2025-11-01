<?php

namespace Database\Seeders;

use App\Models\CollectRequest;
use App\Models\Device;
use App\Models\Referrer;
use App\Models\TemperatureLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@bion.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create Operator Users
        $operator1 = User::create([
            'name' => 'John Operator',
            'email' => 'john@bion.test',
            'password' => Hash::make('password'),
            'role' => 'operator',
        ]);

        $operator2 = User::create([
            'name' => 'Jane Operator',
            'email' => 'jane@bion.test',
            'password' => Hash::make('password'),
            'role' => 'operator',
        ]);

        // Create Referrers
        $referrers = [
            Referrer::create([
                'name' => 'Main Warehouse',
                'address' => '123 Industrial Ave, City, State 12345',
                'latitude' => 40.7128,
                'longitude' => -74.0060,
            ]),
            Referrer::create([
                'name' => 'Distribution Center North',
                'address' => '456 North Blvd, Northville, State 67890',
                'latitude' => 42.3314,
                'longitude' => -83.0458,
            ]),
            Referrer::create([
                'name' => 'South Regional Office',
                'address' => '789 South Street, Southtown, State 11111',
                'latitude' => 33.7490,
                'longitude' => -84.3880,
            ]),
        ];

        // Create Devices
        $device1 = Device::create(['mac' => 'AA:BB:CC:DD:EE:01']);
        $device2 = Device::create(['mac' => 'AA:BB:CC:DD:EE:02']);

        // Create Collect Requests - Not Started
        CollectRequest::create([
            'user_id' => $operator1->id,
            'referrer_id' => $referrers[0]->id,
            'server_id' => 'SERVER-001',
            'barcodes' => ['BC001', 'BC002', 'BC003'],
        ]);

        // Create Collect Requests - In Progress (Started but not ended)
        CollectRequest::create([
            'user_id' => $operator1->id,
            'referrer_id' => $referrers[1]->id,
            'server_id' => 'SERVER-002',
            'barcodes' => ['BC004', 'BC005'],
            'started_at' => now()->subHours(2),
        ]);

        CollectRequest::create([
            'user_id' => $operator2->id,
            'referrer_id' => $referrers[2]->id,
            'server_id' => 'SERVER-003',
            'barcodes' => ['BC006', 'BC007', 'BC008', 'BC009'],
            'started_at' => now()->subHour(),
        ]);

        // Create Collect Requests - Completed
        $completedRequest1 = CollectRequest::create([
            'user_id' => $operator1->id,
            'referrer_id' => $referrers[0]->id,
            'server_id' => 'SERVER-004',
            'device_id' => $device1->id,
            'barcodes' => ['BC010', 'BC011'],
            'started_at' => now()->subDays(2),
            'ended_at' => now()->subDays(2)->addHours(4),
        ]);

        $completedRequest2 = CollectRequest::create([
            'user_id' => $operator2->id,
            'referrer_id' => $referrers[1]->id,
            'server_id' => 'SERVER-005',
            'device_id' => $device2->id,
            'barcodes' => ['BC012', 'BC013', 'BC014'],
            'started_at' => now()->subDay(),
            'ended_at' => now()->subDay()->addHours(3),
        ]);

        // Create Temperature Logs for completed requests
        for ($i = 0; $i < 10; $i++) {
            TemperatureLog::create([
                'device_id' => $device1->id,
                'value' => 23.5 + ($i * 0.3),
                'timestamp' => now()->subDays(2)->addMinutes($i * 30),
            ]);
        }

        for ($i = 0; $i < 8; $i++) {
            TemperatureLog::create([
                'device_id' => $device2->id,
                'value' => 22.1 + ($i * 0.2),
                'timestamp' => now()->subDay()->addMinutes($i * 45),
            ]);
        }
    }
}
