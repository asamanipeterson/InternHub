<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\OneTimePassCode;
use Carbon\Carbon;

class MentorWelcomeSetPassword extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        // Generate OTP
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        OneTimePassCode::updateOrCreate(
            ['user_id' => $notifiable->id],
            [
                'code'       => $code,
                'expires_at' => Carbon::now()->addMinutes(10),
            ]
        );

        // Use FRONTEND_URL for the link (React page)
        $setPasswordUrl = config('app.frontend_url', 'http://localhost:8080') . '/set-mentor-password';

        return (new MailMessage)
            ->subject('Welcome! Set Your Mentor Password – Action Required')
            ->greeting("Hello {$notifiable->first_name},")
            ->line("You've been added as a mentor on Student Industry Connect.")
            ->line("**Your login email is:** {$notifiable->email}")
            ->line("To access your dashboard and see your student bookings, please set your password now.")
            ->action('Set My Password Now', $setPasswordUrl)
            ->line("Or visit directly:")
            ->line($setPasswordUrl)
            ->line("Steps:")
            ->line("1. Go to the link above")
            ->line("2. Enter your email: {$notifiable->email}")
            ->line("3. Use the code from this email")
            ->line("4. Create your new password")
            ->line("If you didn't expect this email, please ignore it or contact support.")
            ->salutation('Best regards,')
            ->salutation('Student Industry Connect Team');
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
