<?php

namespace App\Console\Commands;

use App\Models\MentorBooking;
use Illuminate\Console\Command;
use Carbon\Carbon;

class ExpireOldMentorBookings extends Command
{
    protected $signature = 'mentor-bookings:expire';
    protected $description = 'Expire pending mentor bookings older than 24 hours';

    public function handle()
    {
        $expired = MentorBooking::where('status', 'pending')
            ->where('payment_expires_at', '<', now())
            ->get();

        $count = $expired->count();

        if ($count > 0) {
            $ids = $expired->pluck('id')->implode(', ');
            MentorBooking::whereIn('id', $expired->pluck('id'))
                ->update(['status' => 'expired']);

            $this->info("Expired {$count} pending bookings: IDs {$ids}");
        } else {
            $this->info("No pending bookings to expire.");
        }
    }
}
