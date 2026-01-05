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
    ];

    protected $casts = [
        'total_slots' => 'integer',
        'available_slots' => 'integer',
    ];
}
