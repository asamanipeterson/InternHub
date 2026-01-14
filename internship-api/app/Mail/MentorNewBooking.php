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
        $this->booking = $booking->load(['mentor']); // eager load mentor relationship
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
        // Optional: log in development for debugging
        if (app()->environment('local', 'testing')) {
            Log::info('MentorNewBooking email queued', [
                'booking_id' => $this->booking->id,
                'to'         => $this->booking->mentor?->zoom_email ?? $this->booking->mentor?->email ?? 'unknown',
                'student'    => $this->booking->student_name,
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
        // You could add .ics calendar attachment here in the future if desired
    }
}
