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

    public function __construct($bookingId)
    {
        $this->bookingId = $bookingId;
    }

    public function handle(): void
    {
        $booking = Booking::find($this->bookingId);

        if (!$booking) {
            Log::info("ExpireBookingJob: Booking {$this->bookingId} not found");
            return;
        }

        if ($booking->status !== 'approved') {
            Log::info("ExpireBookingJob: Skipped – booking {$this->bookingId} is {$booking->status}");
            return;
        }

        // IMPORTANT: Do NOT increment available_slots
        // Slot was never decremented → nothing to return

        $booking->update([
            'status'     => 'expired',
            'expires_at' => null,
        ]);

        Log::info("Booking {$this->bookingId} expired (unpaid). No slot change.");

        // Optional: send expiration notice email
        // Mail::to($booking->student_email)->send(new BookingExpiredMail($booking));
    }
}
