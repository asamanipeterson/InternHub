<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Models\OneTimePassCode;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'university',
        'course',
        'year',
        'phone',
        'nationality',
        'user_type', // keep if you use it
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function generateOtp()
    {
        // Generate OTP
        $otpCode = rand(100000, 999999);

        // Delete old OTP if exists
        $this->oneTimePassword()->delete();

        // Save new OTP
        $this->oneTimePassword()->create([
            'code' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes(5),
        ]);

        // Send OTP mail
        // Mail::to($this->email)->send(new OtpMail($otpCode));

        return $otpCode; // optional, in case you want to log/debug
    }
}
