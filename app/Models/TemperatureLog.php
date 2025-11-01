<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemperatureLog extends Model
{
    protected $fillable = [
        'device_id',
        'value',
        'timestamp',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'value' => 'decimal:2',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}
