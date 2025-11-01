<?php

namespace Tests\Feature\Admin;

use App\Models\Referrer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferrerManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $operator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->operator = User::factory()->create(['role' => 'operator']);
    }

    public function test_admin_can_list_all_referrers(): void
    {
        Referrer::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/referrers');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_operator_cannot_list_referrers(): void
    {
        $response = $this->actingAs($this->operator)
            ->getJson('/api/admin/referrers');

        $response->assertStatus(403);
    }

    public function test_admin_can_create_referrer_with_location(): void
    {
        $data = [
            'name' => 'New Warehouse',
            'address' => '123 Industrial Ave',
            'latitude' => 40.7128,
            'longitude' => -74.0060,
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/referrers', $data);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'name' => 'New Warehouse',
                'latitude' => '40.71280000',
                'longitude' => '-74.00600000',
            ]);

        $this->assertDatabaseHas('referrers', [
            'name' => 'New Warehouse',
        ]);
    }

    public function test_admin_can_create_referrer_without_location(): void
    {
        $data = [
            'name' => 'New Warehouse',
            'address' => '123 Industrial Ave',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/referrers', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('referrers', [
            'name' => 'New Warehouse',
        ]);
    }

    public function test_create_referrer_validates_latitude_range(): void
    {
        $data = [
            'name' => 'Invalid Referrer',
            'latitude' => 100, // Invalid: > 90
            'longitude' => 0,
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/referrers', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['latitude']);
    }

    public function test_create_referrer_validates_longitude_range(): void
    {
        $data = [
            'name' => 'Invalid Referrer',
            'latitude' => 0,
            'longitude' => 200, // Invalid: > 180
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/referrers', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['longitude']);
    }

    public function test_admin_can_view_single_referrer(): void
    {
        $referrer = Referrer::factory()->create([
            'name' => 'Test Warehouse',
            'latitude' => 40.7128,
            'longitude' => -74.0060,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/referrers/{$referrer->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'name' => 'Test Warehouse',
            ]);
    }

    public function test_admin_can_update_referrer(): void
    {
        $referrer = Referrer::factory()->create([
            'name' => 'Old Name',
        ]);

        $data = [
            'name' => 'Updated Name',
            'latitude' => 42.3314,
            'longitude' => -83.0458,
        ];

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/referrers/{$referrer->id}", $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('referrers', [
            'id' => $referrer->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_admin_can_delete_referrer(): void
    {
        $referrer = Referrer::factory()->create();

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/referrers/{$referrer->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('referrers', [
            'id' => $referrer->id,
        ]);
    }

    public function test_operator_cannot_create_referrer(): void
    {
        $data = [
            'name' => 'New Warehouse',
        ];

        $response = $this->actingAs($this->operator)
            ->postJson('/api/admin/referrers', $data);

        $response->assertStatus(403);
    }

    public function test_operator_cannot_update_referrer(): void
    {
        $referrer = Referrer::factory()->create();

        $response = $this->actingAs($this->operator)
            ->putJson("/api/admin/referrers/{$referrer->id}", ['name' => 'Updated']);

        $response->assertStatus(403);
    }

    public function test_operator_cannot_delete_referrer(): void
    {
        $referrer = Referrer::factory()->create();

        $response = $this->actingAs($this->operator)
            ->deleteJson("/api/admin/referrers/{$referrer->id}");

        $response->assertStatus(403);
    }
}
