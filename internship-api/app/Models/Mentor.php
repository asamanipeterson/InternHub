<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Mentor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'uuid',
        'title',
        'specialization',
        'bio',
        'image',
        'experience',
        'rating',
        'session_price',
        'google_calendar_email',
        'google_access_token',
        'google_refresh_token',
        'google_token_expires_in',
        'google_token_created_at',
    ];

    protected $casts = [
        'experience'              => 'integer',
        'rating'                  => 'decimal:2',
        'session_price'           => 'decimal:2',
        'google_token_created_at' => 'datetime',
    ];

    /**
     * Automatically include this in JSON responses
     */
    protected $appends = ['is_google_connected'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($mentor) {
            if (empty($mentor->uuid)) {
                $mentor->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Use UUID for routing instead of ID
     */
    public function getRouteKeyName()
    {
        return 'uuid';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function availabilities()
    {
        return $this->hasMany(MentorAvailability::class);
    }

    /**
     * Get active (paid) bookings count
     */
    public function activeBookingsCount()
    {
        return MentorBooking::where('mentor_id', $this->id)
            ->where('status', 'paid')
            ->count();
    }

    /**
     * Encrypt Google Access Token
     */
    public function setGoogleAccessTokenAttribute($value)
    {
        $this->attributes['google_access_token'] = $value ? encrypt($value) : null;
    }

    /**
     * Decrypt Google Access Token
     */
    public function getGoogleAccessTokenAttribute($value)
    {
        try {
            return $value ? decrypt($value) : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Encrypt Google Refresh Token
     */
    public function setGoogleRefreshTokenAttribute($value)
    {
        $this->attributes['google_refresh_token'] = $value ? encrypt($value) : null;
    }

    /**
     * Decrypt Google Refresh Token
     */
    public function getGoogleRefreshTokenAttribute($value)
    {
        try {
            return $value ? decrypt($value) : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Check if Google is connected
     */
    public function getIsGoogleConnectedAttribute()
    {
        return !empty($this->google_refresh_token);
    }
}
