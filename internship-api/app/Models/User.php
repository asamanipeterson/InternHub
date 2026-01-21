<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Mentor;
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
        'user_type',
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

    public function mentor()
    {
        return $this->hasOne(Mentor::class);
    }

    public function isAdmin(): bool
    {
        return $this->user_type === 'admin';
    }

    public function isMentor(): bool
    {
        return $this->user_type === 'mentor';
    }

    public function isStudent(): bool
    {
        return $this->user_type === 'user';
    }

    public function oneTimePassword()
    {
        return $this->hasOne(OneTimePassCode::class);
    }

    public function generateOtp()
    {
        $otpCode = rand(100000, 999999);

        $this->oneTimePassword()->delete();

        $this->oneTimePassword()->create([
            'code' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes(5),
        ]);

        // Mail::to($this->email)->send(new OtpMail($otpCode));

        return $otpCode;
    }

    public function adminIndustries()
    {
        return $this->hasMany(AdminIndustry::class);
    }

    /**
     * Check if this is a super admin (full access)
     */
    public function isSuperAdmin(): bool
    {
        return $this->user_type === 'admin';
    }

    /**
     * Check if this is an industry-specific admin
     */
    public function isIndustryAdmin(): bool
    {
        return $this->user_type === 'industry_admin';
    }

    /**
     * Get array of industries this admin can see/manage
     * Super admins return empty array = all industries
     */
    public function getManagedIndustries(): array
    {
        if ($this->isSuperAdmin()) {
            return [];
        }

        return $this->adminIndustries()->pluck('industry')->toArray();
    }
}
