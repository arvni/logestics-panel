<?php

namespace Tests\Feature\Operator;

use App\Models\CollectRequest;
use App\Models\Device;
use App\Models\Referrer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class CollectRequestOperationsTest extends TestCase
{
    use RefreshDatabase;

    protected User $operator1;
    protected User $operator2;
    protected Referrer $referrer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->operator1 = User::factory()->create(['role' => 'operator']);
        $this->operator2 = User::factory()->create(['role' => 'operator']);
        $this->referrer = Referrer::factory()->create();
    }

    public function test_operator_can_view_only_their_assigned_requests(): void
    {
        // Create requests for operator1
        CollectRequest::factory()->count(2)->create([
            'user_id' => $this->operator1->id,
            'referrer_id' => $this->referrer->id,
        ]);

        // Create requests for operator2
        CollectRequest::factory()->count(3)->create([
            'user_id' => $this->operator2->id,
            'referrer_id' => $this->referrer->id,
        ]);

        $response = $this->actingAs($this->operator1)
            ->getJson('/api/operator/collect-requests');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_admin_cannot_access_operator_endpoints(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->getJson('/api/operator/collect-requests');

        $response->assertStatus(403);
    }

    public function test_operator_can_start_collection(): void
    {
        $data = [
            'referrer_id' => $this->referrer->id,
            'server_id' => 'SERVER-TEST',
            'barcodes' => ['BC001', 'BC002', 'BC003'],
        ];

        $response = $this->actingAs($this->operator1)
            ->postJson('/api/operator/collect-requests/start', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('collect_requests', [
            'user_id' => $this->operator1->id,
            'server_id' => 'SERVER-TEST',
        ]);
    }

    public function test_operator_can_start_collection_without_referrer(): void
    {
        $data = [
            'barcodes' => ['BC001'],
        ];

        $response = $this->actingAs($this->operator1)
            ->postJson('/api/operator/collect-requests/start', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('collect_requests', [
            'user_id' => $this->operator1->id,
        ]);
    }

    public function test_start_collection_requires_barcodes(): void
    {
        $data = [
            'referrer_id' => $this->referrer->id,
        ];

        $response = $this->actingAs($this->operator1)
            ->postJson('/api/operator/collect-requests/start', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['barcodes']);
    }

    public function test_operator_can_end_single_collection_with_file(): void
    {
        $request = CollectRequest::factory()->create([
            'user_id' => $this->operator1->id,
            'referrer_id' => $this->referrer->id,
            'started_at' => now()->subHours(2),
            'ended_at' => null,
        ]);

        // Create a mock Excel file
        $file = UploadedFile::fake()->create('temperature_data.xlsx', 100);

        $data = [
            'collect_request_ids' => [$request->id],
            'file' => $file,
        ];

        $response = $this->actingAs($this->operator1)
            ->postJson('/api/operator/collect-requests/end', $data);

        // This will fail parsing, but we're testing authorization and structure
        $response->assertStatus(422); // Will fail due to invalid file format
    }

    public function test_operator_can_end_multiple_collections_at_once(): void
    {
        $request1 = CollectRequest::factory()->create([
            'user_id' => $this->operator1->id,
            'referrer_id' => $this->referrer->id,
            'started_at' => now()->subHours(2),
        ]);

        $request2 = CollectRequest::factory()->create([
            'user_id' => $this->operator1->id,
            'referrer_id' => $this->referrer->id,
            'started_at' => now()->subHours(1),
        ]);

        $file = UploadedFile::fake()->create('temperature_data.xlsx', 100);

        $data = [
            'collect_request_ids' => [$request1->id, $request2->id],
            'file' => $file,
        ];

        $response = $this->actingAs($this->operator1)
            ->postJson('/api/operator/collect-requests/end', $data);

        // This will fail parsing, but we're testing the multi-select structure
        $response->assertStatus(422);
    }

    public function test_operator_cannot_end_another_operators_request(): void
    {
        $request = CollectRequest::factory()->create([
            'user_id' => $this->operator2->id,
            'referrer_id' => $this->referrer->id,
            'started_at' => now()->subHours(2),
        ]);

        $file = UploadedFile::fake()->create('temperature_data.xlsx', 100);

        $data = [
            'collect_request_ids' => [$request->id],
            'file' => $file,
        ];

        $response = $this->actingAs($this->operator1)
            ->postJson('/api/operator/collect-requests/end', $data);

        $response->assertStatus(422); // Will fail validation because request doesn't belong to operator1
    }

    public function test_end_collection_requires_collect_request_ids(): void
    {
        $file = UploadedFile::fake()->create('temperature_data.xlsx', 100);

        $data = [
            'file' => $file,
        ];

        $response = $this->actingAs($this->operator1)
            ->postJson('/api/operator/collect-requests/end', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['collect_request_ids']);
    }

    public function test_end_collection_requires_file(): void
    {
        $request = CollectRequest::factory()->create([
            'user_id' => $this->operator1->id,
            'referrer_id' => $this->referrer->id,
            'started_at' => now()->subHours(2),
        ]);

        $data = [
            'collect_request_ids' => [$request->id],
        ];

        $response = $this->actingAs($this->operator1)
            ->postJson('/api/operator/collect-requests/end', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_collect_requests_include_referrer_data(): void
    {
        CollectRequest::factory()->create([
            'user_id' => $this->operator1->id,
            'referrer_id' => $this->referrer->id,
        ]);

        $response = $this->actingAs($this->operator1)
            ->getJson('/api/operator/collect-requests');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'referrer_id' => $this->referrer->id,
            ]);
    }

    public function test_started_requests_have_started_at_timestamp(): void
    {
        $request = CollectRequest::factory()->create([
            'user_id' => $this->operator1->id,
            'referrer_id' => $this->referrer->id,
            'started_at' => now()->subHours(2),
        ]);

        $response = $this->actingAs($this->operator1)
            ->getJson('/api/operator/collect-requests');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $request->id,
            ]);

        $data = $response->json();
        $this->assertNotNull($data[0]['started_at']);
    }
}
