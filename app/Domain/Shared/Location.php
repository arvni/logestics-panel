<?php

namespace App\Domain\Shared;

class Location
{
    private function __construct(
        private readonly float $latitude,
        private readonly float $longitude
    ) {
        $this->validate();
    }

    public static function create(float $latitude, float $longitude): self
    {
        return new self($latitude, $longitude);
    }

    private function validate(): void
    {
        if ($this->latitude < -90 || $this->latitude > 90) {
            throw new \InvalidArgumentException('Latitude must be between -90 and 90');
        }

        if ($this->longitude < -180 || $this->longitude > 180) {
            throw new \InvalidArgumentException('Longitude must be between -180 and 180');
        }
    }

    public function latitude(): float
    {
        return $this->latitude;
    }

    public function longitude(): float
    {
        return $this->longitude;
    }

    public function toArray(): array
    {
        return [
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
        ];
    }
}
