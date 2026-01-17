<?php

namespace App\Mail;

use App\Models\MentorBooking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MentorBookingConfirmed extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $booking;

    public function __construct(MentorBooking $booking)
    {
        // Load mentor relationship to ensure we have the name in the view
        $this->booking = $booking->load('mentor');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Confirmed: Mentorship Session with ' . $this->booking->mentor->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.mentor_booking_confirmed',
            with: [
                'booking' => $this->booking,
                // Using the safe config call
                'frontendUrl' => config('app.frontend_url'),
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
