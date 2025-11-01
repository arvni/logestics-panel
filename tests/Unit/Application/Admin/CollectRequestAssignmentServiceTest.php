<?php

namespace Tests\Unit\Application\Admin;

use App\Application\Admin\CollectRequestAssignmentService;
use App\Domain\CollectRequest\CollectRequestRepositoryInterface;
use App\Models\CollectRequest;
use App\Models\User;
use Illuminate\Support\Collection;
use Mockery;
use PHPUnit\Framework\TestCase;

class CollectRequestAssignmentServiceTest extends TestCase
{
    private CollectRequestRepositoryInterface $repository;
    private CollectRequestAssignmentService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = Mockery::mock(CollectRequestRepositoryInterface::class);
        $this->service = new CollectRequestAssignmentService($this->repository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_get_all_collect_requests(): void
    {
        $expectedRequests = new Collection([
            new CollectRequest(['id' => 1, 'server_id' => 'SERVER-001']),
            new CollectRequest(['id' => 2, 'server_id' => 'SERVER-002']),
        ]);

        $this->repository
            ->shouldReceive('findAll')
            ->once()
            ->andReturn($expectedRequests);

        $result = $this->service->getAllCollectRequests();

        $this->assertInstanceOf(Collection::class, $result);
        $this->assertCount(2, $result);
    }

    public function test_create_collect_request(): void
    {
        $data = [
            'user_id' => 1,
            'referrer_id' => 1,
            'server_id' => 'SERVER-001',
            'barcodes' => ['BC001', 'BC002'],
        ];

        $expectedRequest = new CollectRequest($data);

        $this->repository
            ->shouldReceive('create')
            ->once()
            ->with($data)
            ->andReturn($expectedRequest);

        $result = $this->service->createCollectRequest($data);

        $this->assertInstanceOf(CollectRequest::class, $result);
        $this->assertEquals('SERVER-001', $result->server_id);
    }

    public function test_delete_collect_request(): void
    {
        $requestId = 1;

        $this->repository
            ->shouldReceive('delete')
            ->once()
            ->with($requestId)
            ->andReturn(true);

        $result = $this->service->deleteCollectRequest($requestId);

        $this->assertTrue($result);
    }
}
