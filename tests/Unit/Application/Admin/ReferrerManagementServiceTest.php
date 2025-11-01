<?php

namespace Tests\Unit\Application\Admin;

use App\Application\Admin\ReferrerManagementService;
use App\Domain\Referrer\ReferrerRepositoryInterface;
use App\Domain\Shared\Location;
use App\Models\Referrer;
use Illuminate\Support\Collection;
use Mockery;
use PHPUnit\Framework\TestCase;

class ReferrerManagementServiceTest extends TestCase
{
    private ReferrerRepositoryInterface $repository;
    private ReferrerManagementService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = Mockery::mock(ReferrerRepositoryInterface::class);
        $this->service = new ReferrerManagementService($this->repository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_get_all_referrers_returns_collection(): void
    {
        $expectedReferrers = new Collection([
            new Referrer(['id' => 1, 'name' => 'Test Referrer 1']),
            new Referrer(['id' => 2, 'name' => 'Test Referrer 2']),
        ]);

        $this->repository
            ->shouldReceive('findAll')
            ->once()
            ->andReturn($expectedReferrers);

        $result = $this->service->getAllReferrers();

        $this->assertInstanceOf(Collection::class, $result);
        $this->assertCount(2, $result);
    }

    public function test_create_referrer_with_location(): void
    {
        $data = [
            'name' => 'New Referrer',
            'address' => '123 Test St',
            'latitude' => 40.7128,
            'longitude' => -74.0060,
        ];

        $expectedReferrer = new Referrer($data);

        $this->repository
            ->shouldReceive('create')
            ->once()
            ->with($data)
            ->andReturn($expectedReferrer);

        $result = $this->service->createReferrer($data);

        $this->assertInstanceOf(Referrer::class, $result);
        $this->assertEquals('New Referrer', $result->name);
    }

    public function test_create_referrer_without_location(): void
    {
        $data = [
            'name' => 'New Referrer',
            'address' => '123 Test St',
        ];

        $expectedData = [
            'name' => 'New Referrer',
            'address' => '123 Test St',
            'latitude' => null,
            'longitude' => null,
        ];

        $expectedReferrer = new Referrer($expectedData);

        $this->repository
            ->shouldReceive('create')
            ->once()
            ->with($expectedData)
            ->andReturn($expectedReferrer);

        $result = $this->service->createReferrer($data);

        $this->assertInstanceOf(Referrer::class, $result);
    }

    public function test_update_referrer(): void
    {
        $referrerId = 1;
        $data = [
            'name' => 'Updated Referrer',
            'latitude' => 42.3314,
            'longitude' => -83.0458,
        ];

        $expectedData = [
            'name' => 'Updated Referrer',
            'address' => null,
            'latitude' => 42.3314,
            'longitude' => -83.0458,
        ];

        $expectedReferrer = new Referrer($expectedData);

        $this->repository
            ->shouldReceive('update')
            ->once()
            ->with($referrerId, $expectedData)
            ->andReturn($expectedReferrer);

        $result = $this->service->updateReferrer($referrerId, $data);

        $this->assertInstanceOf(Referrer::class, $result);
    }

    public function test_delete_referrer(): void
    {
        $referrerId = 1;

        $this->repository
            ->shouldReceive('delete')
            ->once()
            ->with($referrerId)
            ->andReturn(true);

        $result = $this->service->deleteReferrer($referrerId);

        $this->assertTrue($result);
    }

    public function test_find_referrer_by_id(): void
    {
        $referrerId = 1;
        $expectedReferrer = new Referrer([
            'name' => 'Test Referrer',
        ]);
        $expectedReferrer->id = $referrerId;

        $this->repository
            ->shouldReceive('findById')
            ->once()
            ->with($referrerId)
            ->andReturn($expectedReferrer);

        $result = $this->service->getReferrerById($referrerId);

        $this->assertInstanceOf(Referrer::class, $result);
        $this->assertEquals('Test Referrer', $result->name);
    }
}
