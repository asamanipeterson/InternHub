<?php

namespace App\Mail;

use App\Models\MentorBooking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MentorNewBooking extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $booking;

    /**
     * Create a new message instance.
     */
    public function __construct(MentorBooking $booking)
    {
        // Eager load mentor to ensure we have contact info
        $this->booking = $booking->load(['mentor']);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $studentName = $this->booking->student_name ?? 'A Student';
        $sessionTime = $this->booking->scheduled_at
            ? \Carbon\Carbon::parse($this->booking->scheduled_at)->format('M j, Y g:i A')
            : 'Upcoming';

        return new Envelope(
            subject: "New Booking: {$studentName} - {$sessionTime}",
            replyTo: [$this->booking->student_email ?? config('mail.from.address')],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        if (app()->environment('local', 'testing')) {
            Log::info('MentorNewBooking email queued', [
                'booking_id' => $this->booking->id,
                'to'         => $this->booking->mentor?->email ?? 'unknown',
                'student'    => $this->booking->student_name,
                'meet_link'  => $this->booking->google_meet_link,
            ]);
        }

        return new Content(
            view: 'emails.mentor_new_booking',
            with: [
                'booking' => $this->booking,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
