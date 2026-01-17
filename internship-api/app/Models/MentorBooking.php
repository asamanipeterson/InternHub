<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MentorBooking extends Model
{
    protected $fillable = [
        'mentor_id',
        'user_id',
        'student_name',
        'student_email',
        'student_phone',
        'age',
        'student_university',
        'student_course',
        'student_level',
        'scheduled_at',
        'paystack_reference',
        'amount',
        'currency',
        'google_meet_link',          // Replaced Zoom
        'google_calendar_event_id',  // Replaced Zoom
        'status',
        'payment_expires_at',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'payment_expires_at' => 'datetime',
    ];

    public function mentor()
    {
        return $this->belongsTo(Mentor::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
