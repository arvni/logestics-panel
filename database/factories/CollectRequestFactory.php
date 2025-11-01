<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CollectRequest>
 */
class CollectRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'server_id' => 'SERVER-' . strtoupper(fake()->bothify('???-###')),
            'barcodes' => [
                'BC' . fake()->unique()->numerify('####'),
                'BC' . fake()->unique()->numerify('####'),
                'BC' . fake()->unique()->numerify('####'),
            ],
            'started_at' => null,
            'ended_at' => null,
            'device_id' => null,
        ];
    }
}
