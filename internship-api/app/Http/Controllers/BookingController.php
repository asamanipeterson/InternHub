<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Company;
use App\Mail\PaymentLinkMail;
use App\Mail\ApplicationRejectedMail;
use App\Jobs\ExpireBookingJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * Store a new internship application (student submission)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'company_id'   => 'required|exists:companies,id',
            'student_name' => 'required|string|max:255',
            'student_email' => 'required|email|max:255',
            'student_phone' => 'required|string|max:20',
            'student_id'   => 'required|string|max:50',
            'university'   => 'required|string|max:255',
            'cv'           => 'required|mimes:pdf|max:10000', // 10MB max
        ]);

        $company = Company::findOrFail($data['company_id']);

        if ($company->available_slots <= 0) {
            return response()->json([
                'message' => 'No available slots for this company.'
            ], 400);
        }

        // Store CV in storage/app/public/cvs
        $cvPath = $request->file('cv')->store('cvs', 'public');

        $booking = Booking::create([
            'company_id'      => $data['company_id'],
            'student_name'    => $data['student_name'],
            'student_email'   => $data['student_email'],
            'student_phone'   => $data['student_phone'],
            'student_id'      => $data['student_id'],
            'university'      => $data['university'],
            'cv_path'         => $cvPath,
            'status'          => 'pending',
        ]);

        return response()->json([
            'message' => 'Application submitted successfully. It is now pending admin review.',
            'booking' => $booking->load('company')
        ], 201);
    }

    /**
     * Get all bookings (for admin dashboard)
     */
    public function index()
    {
        $bookings = Booking::with('company')->latest()->get();

        return response()->json($bookings);
    }

    /**
     * Approve a pending application → Reserve slot + Initialize Paystack + Send email
     */
    public function approve($id, Request $request)
    {
        // Fixed fee: GHS 2.00 = 200 pesewas
        $amountInPesewas = 200;

        $booking = Booking::with('company')->findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending applications can be approved.'
            ], 400);
        }

        // Prevent approval if no slots left
        if ($booking->company->available_slots <= 0) {
            return response()->json([
                'message' => 'No available slots remaining for this company.'
            ], 400);
        }

        // Reserve the slot immediately on approval
        $booking->company->decrement('available_slots');

        // Generate unique payment reference
        $reference = 'intern_' . Str::random(10) . '_' . $booking->id;

        // Initialize Paystack transaction with Card + Mobile Money support
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.paystack.secret_key'),
            'Content-Type'  => 'application/json',
        ])->post('https://api.paystack.co/transaction/initialize', [
            'reference'     => $reference,
            'amount'        => $amountInPesewas,
            'currency'      => 'GHS',
            'email'         => $booking->student_email,
            'callback_url'  => route('payment.callback'),
            'channels'      => ['card', 'mobile_money'], // Enables both Card and MoMo
            'metadata'      => [
                'booking_id'   => $booking->id,
                'company_name' => $booking->company->name,
            ],
        ]);

        if (!$response->successful() || !$response->json('status')) {
            // If payment init fails, free the slot back
            $booking->company->increment('available_slots');

            return response()->json([
                'message' => 'Failed to initialize payment with Paystack.',
                'error'   => $response->json()
            ], 500);
        }

        $data = $response->json('data');

        // Update booking to approved with 24-hour expiry
        $booking->update([
            'status'            => 'approved',
            'payment_reference' => $reference,
            'amount'            => $amountInPesewas,
            'currency'          => 'GHS',
            'expires_at'        => now()->addHours(24),
            // 'expires_at' => now()->addSeconds(30), // For testing purposes
        ]);

        // Send payment link email
        Mail::to($booking->student_email)->send(new PaymentLinkMail($booking, $data['authorization_url']));

        // Schedule auto-expiry after 24 hours
        ExpireBookingJob::dispatch($booking->id)->delay(now()->addHours(24));
        // ExpireBookingJob::dispatch($booking->id)->delay(now()->addSeconds(30)); // For testing purposes

        return response()->json([
            'message'     => 'Application approved. Payment link for GHS 2.00 sent to student.',
            'payment_url' => $data['authorization_url']
        ]);
    }

    /**
     * Reject a pending application with reason
     */
    public function reject($id, Request $request)
    {
        $request->validate([
            'reason' => 'required|string|min:10|max:1000',
        ]);

        $booking = Booking::findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Cannot reject a non-pending application.'
            ], 400);
        }

        $booking->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->reason,
            'expires_at'       => null,
        ]);

        // Send rejection email
        Mail::to($booking->student_email)->send(new ApplicationRejectedMail($booking));

        return response()->json([
            'message' => 'Application rejected and notification sent.'
        ]);
    }
}
