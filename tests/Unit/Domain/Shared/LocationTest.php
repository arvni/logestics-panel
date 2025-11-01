<?php

namespace Tests\Unit\Domain\Shared;

use App\Domain\Shared\Location;
use PHPUnit\Framework\TestCase;

class LocationTest extends TestCase
{
    public function test_can_create_valid_location(): void
    {
        $location = Location::create(40.7128, -74.0060);

        $this->assertInstanceOf(Location::class, $location);
        $this->assertEquals(40.7128, $location->latitude());
        $this->assertEquals(-74.0060, $location->longitude());
    }

    public function test_to_array_returns_correct_structure(): void
    {
        $location = Location::create(42.3314, -83.0458);

        $array = $location->toArray();

        $this->assertIsArray($array);
        $this->assertArrayHasKey('latitude', $array);
        $this->assertArrayHasKey('longitude', $array);
        $this->assertEquals(42.3314, $array['latitude']);
        $this->assertEquals(-83.0458, $array['longitude']);
    }

    public function test_throws_exception_for_latitude_too_low(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Latitude must be between -90 and 90');

        Location::create(-91, 0);
    }

    public function test_throws_exception_for_latitude_too_high(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Latitude must be between -90 and 90');

        Location::create(91, 0);
    }

    public function test_throws_exception_for_longitude_too_low(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Longitude must be between -180 and 180');

        Location::create(0, -181);
    }

    public function test_throws_exception_for_longitude_too_high(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Longitude must be between -180 and 180');

        Location::create(0, 181);
    }

    public function test_accepts_valid_edge_case_latitudes(): void
    {
        $locationMin = Location::create(-90, 0);
        $locationMax = Location::create(90, 0);

        $this->assertEquals(-90, $locationMin->latitude());
        $this->assertEquals(90, $locationMax->latitude());
    }

    public function test_accepts_valid_edge_case_longitudes(): void
    {
        $locationMin = Location::create(0, -180);
        $locationMax = Location::create(0, 180);

        $this->assertEquals(-180, $locationMin->longitude());
        $this->assertEquals(180, $locationMax->longitude());
    }
}
