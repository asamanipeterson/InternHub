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

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'name',
        'email',
        'password',
        'university',
        'course',
        'year',
        'phone',
        'nationality',
        'gender',
        'date_of_birth',
        'user_type',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'date_of_birth'     => 'date',   // optional but recommended
        ];
    }

    /**
     * Relationships
     */
    public function mentor()
    {
        return $this->hasOne(Mentor::class);
    }

    public function oneTimePassword()
    {
        return $this->hasOne(OneTimePassCode::class);
    }

    public function adminIndustries()
    {
        return $this->hasMany(AdminIndustry::class);
    }

    /**
     * Attribute Accessors / Mutators
     */
    public function getFullNameAttribute(): string
    {
        $parts = array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
        ]);

        return implode(' ', $parts) ?: $this->email; // fallback to email if name is empty
    }

    /**
     * Helper Methods
     */
    public function generateOtp()
    {
        $otpCode = rand(100000, 999999);

        $this->oneTimePassword()->delete();

        $this->oneTimePassword()->create([
            'code'       => $otpCode,
            'expires_at' => Carbon::now()->addMinutes(5),
        ]);

        // Mail::to($this->email)->send(new OtpMail($otpCode));

        return $otpCode;
    }

    /**
     * Role / Type Checks
     */
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

    public function isSuperAdmin(): bool
    {
        return $this->user_type === 'admin';
    }

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
