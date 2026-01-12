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
        'zoom_meeting_id',
        'zoom_join_url',
        'zoom_start_url',
        'status',
        'payment_expires_at',
    ];

    protected $dates = [
        'scheduled_at',
        'payment_expires_at',
    ];

    public function mentor()
    {
        return $this->belongsTo(Mentor::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
