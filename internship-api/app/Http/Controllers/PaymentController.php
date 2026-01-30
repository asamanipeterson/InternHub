<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\MentorBooking;
use App\Mail\PaymentSuccessMail;
use App\Mail\MentorBookingConfirmed;
use App\Mail\MentorNewBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\MentorBookingController;
use Carbon\Carbon;

class PaymentController extends Controller
{
    /**
     * Handle Paystack Webhook - supports BOTH internship and mentorship bookings
     */
    public function handleWebhook(Request $request)
    {
        // ── Verify webhook signature (very important) ──
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
        // MENTORSHIP BOOKING FLOW (references start with mentorbk_)
        // ────────────────────────────────────────────────
        if (str_starts_with($reference, 'mentorbk_')) {
            $booking = MentorBooking::where('paystack_reference', $reference)->first();

            // Fallback using metadata.booking_id (safer)
            if (!$booking && isset($data['metadata']['booking_id'])) {
                $booking = MentorBooking::find($data['metadata']['booking_id']);
            }

            if (!$booking) {
                Log::warning("Mentorship webhook: Booking not found", [
                    'reference' => $reference,
                    'metadata'  => $data['metadata'] ?? null
                ]);
                return response()->json(['status' => 'success'], 200);
            }

            if ($booking->status === 'paid') {
                Log::info("Mentorship webhook: Already paid - skipping", ['reference' => $reference]);
                return response()->json(['status' => 'success'], 200);
            }

            // Delegate to MentorBookingController logic
            $mentorController = app(MentorBookingController::class);
            $mentorController->processSuccessfulPayment($data, $booking);

            Log::info("Mentorship payment processed via unified webhook", [
                'reference'  => $reference,
                'booking_id' => $booking->id
            ]);

            return response()->json(['status' => 'success'], 200);
        }

        // ────────────────────────────────────────────────
        // INTERNSHIP BOOKING FLOW (all other references)
        // ────────────────────────────────────────────────
        $booking = Booking::where('payment_reference', $reference)
            ->where('status', 'approved')   // only process approved ones
            ->first();

        if (!$booking) {
            Log::warning("Internship webhook: Booking not found or already processed", [
                'reference' => $reference
            ]);
            return response()->json(['status' => 'success'], 200);
        }

        // Mark internship booking as paid
        $booking->update([
            'status'                  => 'paid',
            'paystack_transaction_id' => $data['id'] ?? null,
            'expires_at'              => null,
        ]);

        // Decrement available slots
        $booking->company()->decrement('available_slots');

        // Send email
        try {
            Mail::to($booking->student_email)->queue(new PaymentSuccessMail($booking));
        } catch (\Exception $e) {
            Log::error("Internship success email failed: " . $e->getMessage());
        }

        Log::info("Internship payment processed via unified webhook", [
            'reference'  => $reference,
            'booking_id' => $booking->id
        ]);

        return response()->json(['status' => 'success'], 200);
    }

    /**
     * Redirect after payment (Paystack callback) - mostly for internships
     */
    public function success(Request $request)
    {
        $reference = $request->query('reference');

        if (!$reference) {
            return redirect(env('FRONTEND_URL') . '/internships')->with('error', 'No payment reference');
        }

        // Check mentorship first (if reference starts with mentorbk_)
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
