<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Booking extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'company_id',
        'student_name',
        'first_name',           // new
        'last_name',
        'student_email',
        'student_phone',
        // 'student_id',
        'university',
        'cv_path',
        'status',
        'payment_reference',
        'paystack_transaction_id',
        'amount', // in pesewas (e.g., 50000 = GHS 500.00)
        'currency',
        'rejection_reason',
        'expires_at',
        'has_disability',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expires_at' => 'datetime',
        'amount'     => 'integer',
        'has_disability' => 'boolean',
    ];

    /**
     * Relationship: Booking belongs to a Company
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Accessor: Get formatted amount in GHS (e.g., "GHS 500.00")
     */
    public function getFormattedAmountAttribute(): string
    {
        if (is_null($this->amount)) {
            return '—';
        }

        // Convert pesewas to GHS with 2 decimal places
        $ghs = number_format($this->amount / 100, 2);

        return 'GHS ' . $ghs;
    }

    /**
     * Accessor: Check if the payment window has expired
     */
    public function getIsExpiredAttribute(): bool
    {
        if ($this->status !== 'approved' || is_null($this->expires_at)) {
            return false;
        }

        return Carbon::now()->greaterThan($this->expires_at);
    }

    /**
     * Scope: Only pending bookings
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Approved but not yet paid
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope: Paid bookings
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope: Rejected bookings
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope: Expired bookings (approved but payment window passed)
     */
    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    public function getFirstNameAttribute($value)
    {
        return $value ?? $this->getFirstNameFromStudentName();
    }

    public function getLastNameAttribute($value)
    {
        return $value ?? $this->getLastNameFromStudentName();
    }

    // Fallback logic if first/last are null but student_name exists (for old records)
    protected function getFirstNameFromStudentName()
    {
        $parts = explode(' ', trim($this->student_name ?? ''), 2);
        return $parts[0] ?? '';
    }

    protected function getLastNameFromStudentName()
    {
        $parts = explode(' ', trim($this->student_name ?? ''), 2);
        return $parts[1] ?? '';
    }
}
