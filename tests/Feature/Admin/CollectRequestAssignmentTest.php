<?php

namespace Tests\Feature\Admin;

use App\Models\CollectRequest;
use App\Models\Referrer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CollectRequestAssignmentTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $operator1;
    protected User $operator2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->operator1 = User::factory()->create(['role' => 'operator']);
        $this->operator2 = User::factory()->create(['role' => 'operator']);
    }

    public function test_admin_can_view_all_collect_requests(): void
    {
        $referrer = Referrer::factory()->create();

        CollectRequest::factory()->create([
            'user_id' => $this->operator1->id,
            'referrer_id' => $referrer->id,
        ]);

        CollectRequest::factory()->create([
            'user_id' => $this->operator2->id,
            'referrer_id' => $referrer->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/collect-requests');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_operator_cannot_view_admin_collect_requests(): void
    {
        $response = $this->actingAs($this->operator1)
            ->getJson('/api/admin/collect-requests');

        $response->assertStatus(403);
    }

    public function test_admin_can_create_collect_request(): void
    {
        $referrer = Referrer::factory()->create();

        $data = [
            'user_id' => $this->operator1->id,
            'referrer_id' => $referrer->id,
            'server_id' => 'SERVER-TEST-001',
            'barcodes' => ['BC001', 'BC002', 'BC003'],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/collect-requests', $data);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'server_id' => 'SERVER-TEST-001',
            ]);

        $this->assertDatabaseHas('collect_requests', [
            'server_id' => 'SERVER-TEST-001',
            'user_id' => $this->operator1->id,
            'referrer_id' => $referrer->id,
        ]);
    }

    public function test_admin_can_delete_collect_request(): void
    {
        $referrer = Referrer::factory()->create();
        $request = CollectRequest::factory()->create([
            'user_id' => $this->operator1->id,
            'referrer_id' => $referrer->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/collect-requests/{$request->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('collect_requests', [
            'id' => $request->id,
        ]);
    }

    public function test_admin_can_get_operators_list(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/operators');

        $response->assertStatus(200)
            ->assertJsonCount(2);

        $response->assertJsonFragment([
            'id' => $this->operator1->id,
            'role' => 'operator',
        ]);
    }

    public function test_admin_can_assign_request_to_operator(): void
    {
        $referrer = Referrer::factory()->create();
        $request = CollectRequest::factory()->create([
            'user_id' => $this->operator1->id,
            'referrer_id' => $referrer->id,
        ]);

        $data = [
            'request_id' => $request->id,
            'operator_id' => $this->operator2->id,
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/collect-requests/assign', $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('collect_requests', [
            'id' => $request->id,
            'user_id' => $this->operator2->id,
        ]);
    }

    public function test_operator_cannot_assign_requests(): void
    {
        $referrer = Referrer::factory()->create();
        $request = CollectRequest::factory()->create([
            'user_id' => $this->operator1->id,
            'referrer_id' => $referrer->id,
        ]);

        $data = [
            'request_id' => $request->id,
            'operator_id' => $this->operator2->id,
        ];

        $response = $this->actingAs($this->operator1)
            ->postJson('/api/admin/collect-requests/assign', $data);

        $response->assertStatus(403);
    }

    public function test_create_request_requires_user_id(): void
    {
        $referrer = Referrer::factory()->create();

        $data = [
            'referrer_id' => $referrer->id,
            'server_id' => 'SERVER-001',
            'barcodes' => ['BC001'],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/collect-requests', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['user_id']);
    }

    public function test_create_request_allows_null_referrer_id(): void
    {
        $data = [
            'user_id' => $this->operator1->id,
            'server_id' => 'SERVER-001',
            'barcodes' => ['BC001'],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/collect-requests', $data);

        $response->assertStatus(201);
    }

    public function test_create_request_allows_null_server_id(): void
    {
        $referrer = Referrer::factory()->create();

        $data = [
            'user_id' => $this->operator1->id,
            'referrer_id' => $referrer->id,
            'barcodes' => ['BC001'],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/collect-requests', $data);

        $response->assertStatus(201);
    }

    public function test_create_request_validates_barcodes_is_array(): void
    {
        $referrer = Referrer::factory()->create();

        $data = [
            'user_id' => $this->operator1->id,
            'referrer_id' => $referrer->id,
            'server_id' => 'SERVER-001',
            'barcodes' => 'not-an-array',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/collect-requests', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['barcodes']);
    }
}
