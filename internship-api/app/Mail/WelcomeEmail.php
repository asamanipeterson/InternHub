<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $loginUrl;
    public $appName; // 1. Add this public property

    public function __construct(User $user)
    {
        $this->user = $user;
        $this->appName = config('app.name'); // 2. Assign it here

        // Build frontend login URL
        $base = rtrim(config('app.frontend_url', 'http://localhost:8080'), '/');
        $this->loginUrl = $base . '/auth';
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to ' . $this->appName . ' – Start Your Journey!',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.welcome',
            // You can actually remove the 'with' array now because
            // all public properties are automatically shared with the view.
        );
    }
}
