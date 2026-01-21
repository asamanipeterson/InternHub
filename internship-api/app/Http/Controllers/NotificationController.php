<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\MentorBooking; // Assuming you have this model
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function getUnreadCount(Request $request)
    {
        $user = $request->user();
        $userType = strtolower(trim($user->user_type ?? ''));

        $count = 0;

        if ($userType === 'student' || $userType === 'user') {
            // Student: count of their bookings with status change since last seen
            // For simplicity: count pending + approved + rejected (or customize)
            $count = Booking::where('student_email', $user->email)
                ->whereIn('status', ['approved', 'rejected', 'paid'])
                ->where('updated_at', '>', $user->last_notification_check ?? now()->subDays(30))
                ->count();
        } elseif ($userType === 'mentor') {
            // Mentor: count of new/pending mentorship bookings
            $count = MentorBooking::where('mentor_id', $user->id)
                ->where('status', 'pending') // or 'new', etc.
                ->where('created_at', '>', $user->last_notification_check ?? now()->subDays(7))
                ->count();
        } elseif ($userType === 'industry_admin') {
            // Industry Admin: new pending internship bookings in their industries
            $industries = $user->adminIndustries()->pluck('industry')->toArray();

            $count = Booking::whereHas('company', function ($q) use ($industries) {
                $q->whereIn('industry', $industries);
            })
                ->where('status', 'pending')
                ->where('created_at', '>', $user->last_notification_check ?? now()->subDays(7))
                ->count();
        } elseif ($userType === 'admin') {
            // Super Admin: everything pending/new
            $pendingIntern = Booking::where('status', 'pending')->count();
            $pendingMentor = MentorBooking::where('status', 'pending')->count();
            $count = $pendingIntern + $pendingMentor;
        }

        return response()->json([
            'unread' => $count,
            'type'   => $userType,
        ]);
    }
}
