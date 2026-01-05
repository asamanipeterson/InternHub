<?php

namespace App\Jobs;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExpireBookingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $bookingId;

    /**
     * Create a new job instance.
     */
    public function __construct($bookingId)
    {
        $this->bookingId = $bookingId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Load booking with company to access available_slots
        $booking = Booking::with('company')->find($this->bookingId);

        if (!$booking) {
            Log::info("ExpireBookingJob: Booking ID {$this->bookingId} not found.");
            return;
        }

        // Only act if the booking is still in 'approved' status (payment not completed)
        if ($booking->status === 'approved') {
            // Free the reserved slot back to the company
            $booking->company->increment('available_slots');

            // Expire the booking
            $booking->update([
                'status'      => 'expired',
                'expires_at'  => null,
            ]);

            Log::info("Booking ID {$this->bookingId} has expired. Slot freed for company ID {$booking->company_id}.");
        } else {
            Log::info("ExpireBookingJob: Booking ID {$this->bookingId} skipped (current status: {$booking->status}).");
        }
    }
}
