<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminIndustry extends Model
{
    protected $fillable = [
        'user_id',
        'industry',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
