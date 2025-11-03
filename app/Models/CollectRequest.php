<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollectRequest extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'referrer_id',
        'server_id',
        'device_id',
        'status',
        'started_at',
        'ended_at',
        'barcodes',
        'extra_information',
    ];

    protected $casts = [
        'barcodes' => 'array',
        'extra_information' => 'array',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(Referrer::class);
    }
}
