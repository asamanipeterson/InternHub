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
        'scheduled_at',
        'paystack_reference',
        'amount',
        'currency',
        'zoom_meeting_id',
        'zoom_join_url',
        'zoom_start_url',
        'status'
    ];

    public function mentor()
    {
        return $this->belongsTo(Mentor::class);
    }
}
