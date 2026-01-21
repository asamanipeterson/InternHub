<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\OneTimePassCode;
use Carbon\Carbon;

class SetIndustryAdminPassword extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $otp;
    public $setPasswordUrl;

    public function __construct(User $user)
    {
        $this->user = $user;

        // Generate OTP
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        OneTimePassCode::updateOrCreate(
            ['user_id' => $this->user->id],
            [
                'code'       => $code,
                'expires_at' => Carbon::now()->addMinutes(10),
            ]
        );

        $this->otp = $code;

        $this->setPasswordUrl = config('app.frontend_url', 'http://localhost:8080')
            . '/set-password?user=' . $user->id;
    }

    public function build()
    {
        return $this->subject('Set Your Password - Industry Admin Account')
            ->markdown('emails.industry-admin-set-password')  // ← use ->view() for Blade
            ->with([
                'otp' => $this->otp,
                'setPasswordUrl' => $this->setPasswordUrl,
                'email' => $this->user->email,
                'name' => $this->user->name ?? explode('@', $this->user->email)[0],
            ]);
    }
}
