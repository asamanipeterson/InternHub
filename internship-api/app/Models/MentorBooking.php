<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MentorBooking extends Model
{
    protected $fillable = [
        'mentor_id',
        'user_id',
        'first_name',
        'last_name',
        'student_name',
        'student_email',
        'phone',
        'date_of_birth',
        'student_institution',
        'student_course',
        'student_level',
        'topic_description',
        'scheduled_at',
        'paystack_reference',
        'amount',
        'currency',
        'google_meet_link',
        'google_calendar_event_id',
        'status',
        'payment_expires_at',
    ];

    protected $casts = [
        'scheduled_at'       => 'datetime',
        'payment_expires_at' => 'datetime',
        'date_of_birth'      => 'date',
    ];

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(Mentor::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getStudentFullNameAttribute(): string
    {
        $parts = array_filter([$this->first_name, $this->last_name]);
        return implode(' ', $parts) ?: 'Unknown Student';
    }
}
