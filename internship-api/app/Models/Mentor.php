<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Mentor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'title',
        'specialization',
        'bio',
        'image',
        'experience',
        'rating',
        'session_price',
        'zoom_email',
        'email',
        'uuid'
    ];

    protected $casts = [
        'experience' => 'integer',
        'rating' => 'decimal:2',
        'session_price' => 'decimal:2',   // ← THIS FIXES IT!
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($mentor) {
            $mentor->uuid = Str::random(32);
        });
    }

    // Optional: Route key is UUID instead of ID
    public function getRouteKeyName()
    {
        return 'uuid';
    }
    public function availabilities()
    {
        return $this->hasMany(MentorAvailability::class);
    }

    // Helper: get active (paid) bookings count
    public function activeBookingsCount()
    {
        return MentorBooking::where('mentor_id', $this->id)
            ->where('status', 'paid')
            ->count();
    }
}
