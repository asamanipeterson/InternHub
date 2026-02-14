<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\MentorBooking;
use App\Mail\PaymentSuccessMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\MentorBookingController;

class PaymentController extends Controller
{
    /**
     * Handle Paystack Webhook - supports BOTH internship and mentorship bookings
     */
    public function handleWebhook(Request $request)
    {
        // ── Verify webhook signature ──
        $secret = config('services.paystack.secret_key');
        $signature = $request->header('x-paystack-signature');
        $payload = $request->getContent();
        $computed = hash_hmac('sha512', $payload, $secret);

        if (!hash_equals($computed, $signature ?? '')) {
            Log::warning('Paystack Webhook: Invalid signature');
            return response()->json(['status' => 'invalid signature'], 401);
        }

        $event = $request->json()->all();
        Log::info('Paystack Webhook Received', $event);

        if (($event['event'] ?? '') !== 'charge.success') {
            return response()->json(['status' => 'received'], 200);
        }

        $data = $event['data'] ?? [];
        $reference = $data['reference'] ?? null;

        if (!$reference) {
            Log::warning('Webhook: Missing reference');
            return response()->json(['status' => 'received'], 200);
        }

        // ────────────────────────────────────────────────
        // MENTORSHIP BOOKING FLOW
        // ────────────────────────────────────────────────
        if (str_starts_with($reference, 'mentorbk_')) {
            $booking = MentorBooking::where('paystack_reference', $reference)->first();

            if (!$booking && isset($data['metadata']['booking_id'])) {
                $booking = MentorBooking::find($data['metadata']['booking_id']);
            }

            if (!$booking) {
                Log::warning("Mentorship webhook: Booking not found", ['reference' => $reference]);
                return response()->json(['status' => 'success'], 200);
            }

            if ($booking->status === 'paid') {
                return response()->json(['status' => 'success'], 200);
            }

            $mentorController = app(MentorBookingController::class);
            $mentorController->processSuccessfulPayment($data, $booking);

            return response()->json(['status' => 'success'], 200);
        }

        // ────────────────────────────────────────────────
        // INTERNSHIP BOOKING FLOW
        // ────────────────────────────────────────────────
        $booking = Booking::where('payment_reference', $reference)->first();

        if (!$booking) {
            Log::warning("Internship webhook: Booking not found", ['reference' => $reference]);
            return response()->json(['status' => 'success'], 200);
        }


        if ($booking->status === 'expired') {
            Log::error("Late Payment: User paid for an EXPIRED booking", [
                'booking_id' => $booking->id,
                'email' => $booking->student_email
            ]);
            // We return 200 to acknowledge receipt, but we do NOT mark as paid or reduce slots
            return response()->json(['status' => 'ignored_expired'], 200);
        }

        // If it's already paid (e.g. duplicate webhook), just exit
        if ($booking->status === 'paid') {
            return response()->json(['status' => 'success'], 200);
        }

        // Only process if it is currently 'approved'
        if ($booking->status !== 'approved') {
            Log::warning("Internship webhook: Booking status is {$booking->status}, skipping.");
            return response()->json(['status' => 'success'], 200);
        }

        // Mark internship booking as paid
        $booking->update([
            'status'                  => 'paid',
            'paystack_transaction_id' => $data['id'] ?? null,
            'expires_at'              => null, // Link is used, clear expiry
        ]);

        // Decrement available slots
        $booking->company()->decrement('available_slots');

        // Send success email
        try {
            Mail::to($booking->student_email)->queue(new PaymentSuccessMail($booking));
        } catch (\Exception $e) {
            Log::error("Internship success email failed: " . $e->getMessage());
        }

        return response()->json(['status' => 'success'], 200);
    }

    /**
     * Redirect after payment (Paystack callback)
     */
    public function success(Request $request)
    {
        $reference = $request->query('reference');

        if (!$reference) {
            return redirect(env('FRONTEND_URL') . '/internships')->with('error', 'No payment reference');
        }

        // Check mentorship first
        if (str_starts_with($reference, 'mentorbk_')) {
            $booking = MentorBooking::where('paystack_reference', $reference)->first();

            if ($booking && $booking->status === 'paid') {
                $query = http_build_query([
                    'booking'   => 'success',
                    'meetLink'  => $booking->google_meet_link ?? 'pending',
                    'date'      => $booking->scheduled_at?->format('Y-m-d H:i'),
                    'amount'    => number_format($booking->amount, 2, '.', ''),
                ]);
                return redirect(config('app.frontend_url') . '/mentorship/booked?' . $query);
            }
            return redirect(config('app.frontend_url') . '/mentorship?booking=processing');
        }

        // Internship fallback
        $booking = Booking::where('payment_reference', $reference)->first();

        if (!$booking) {
            return redirect(env('FRONTEND_URL') . '/internships')->with('error', 'Booking not found');
        }

        // 🛑 SECURITY CHECK: Tell the user the link expired if they were too slow
        if ($booking->status === 'expired') {
            return redirect(env('FRONTEND_URL') . '/internships')
                ->with('error', 'Your payment link expired after 5 minutes. Your application has been released.');
        }

        if ($booking->status === 'paid') {
            return redirect(env('FRONTEND_URL') . '/internships')
                ->with('success', 'Payment successful! Your slot is booked.');
        }

        return redirect(env('FRONTEND_URL') . '/internships')
            ->with('info', 'Payment is being processed. Check your email shortly.');
    }

    public function cancel()
    {
        return redirect(env('FRONTEND_URL') . '/internships')
            ->with('info', 'Payment cancelled. Try again later.');
    }
}
