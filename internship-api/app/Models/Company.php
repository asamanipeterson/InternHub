<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo',
        'industry',
        'description',
        'location',
        'total_slots',
        'available_slots',
        'is_paid',
        'requirements',
    ];

    protected $casts = [
        'total_slots'     => 'integer',
        'available_slots' => 'integer',
        'is_paid'         => 'boolean',
        'requirements'    => 'string',
    ];

    // Optional: accessor if you want to present requirements as array
    public function getRequirementsLinesAttribute()
    {
        if (!$this->requirements) {
            return [];
        }
        return array_filter(array_map('trim', explode("\n", $this->requirements)));
    }
}
