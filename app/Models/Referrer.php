<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Referrer extends Model
{
    use HasFactory;
    protected $fillable = [
        'server_id',
        'name',
        'address',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function collectRequests(): HasMany
    {
        return $this->hasMany(CollectRequest::class);
    }
}
