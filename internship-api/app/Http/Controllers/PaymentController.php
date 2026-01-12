<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Mail\PaymentSuccessMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Handle Paystack Webhook
     */
    public function handleWebhook(Request $request)
    {
        // Verify webhook signature
        $secret = config('services.paystack.secret_key');
        $signature = $request->header('x-paystack-signature');

        $payload = $request->getContent();
        $computed = hash_hmac('sha512', $payload, $secret);

        if ($signature !== $computed) {
            Log::warning('Paystack Webhook: Invalid signature');
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $event = $request->json()->all();

        // Log event for debugging
        Log::info('Paystack Webhook Received', $event);

        if ($event['event'] === 'charge.success') {
            $data = $event['data'];
            $reference = $data['reference'];

            $booking = Booking::where('payment_reference', $reference)
                ->whereIn('status', ['approved', 'paid'])
                ->first();

            if (!$booking) {
                Log::warning("Paystack Webhook: Booking not found for reference {$reference}");
                return response()->json(['message' => 'Booking not found'], 404);
            }

            // Prevent double processing
            if ($booking->status === 'paid') {
                return response()->json(['message' => 'Already processed'], 200);
            }

            // Mark as paid
            $booking->update([
                'status' => 'paid',
                'paystack_transaction_id' => $data['id'],
                'expires_at' => null,
            ]);

            // Decrement available slots safely
            $booking->company()->decrement('available_slots');

            // Send success email
            Mail::to($booking->student_email)->send(new PaymentSuccessMail($booking));

            Log::info("Payment successful for Booking ID: {$booking->id}");
            Log::info('Paystack Webhook Event', ['event' => $event['event'], 'reference' => $data['reference'] ?? null]);
        }

        return response()->json(['message' => 'Webhook handled'], 200);
    }

    /**
     * Optional: Redirect page after payment (Paystack redirects here)
     */
    public function success(Request $request)
    {
        $reference = $request->query('reference');

        if (!$reference) {
            return redirect(env('FRONTEND_URL') . '/internships')->with('error', 'No payment reference');
        }

        $booking = Booking::where('payment_reference', $reference)->first();

        if (!$booking) {
            return redirect(env('FRONTEND_URL') . '/internships')->with('error', 'Booking not found');
        }

        if ($booking->status === 'paid') {
            return redirect(env('FRONTEND_URL') . '/internships')->with('success', 'Payment successful! Your slot is booked.');
        }

        return redirect(env('FRONTEND_URL') . '/internships')->with('info', 'Payment is being processed. You will receive a confirmation email shortly.');
    }

    public function cancel()
    {
        return redirect(env('FRONTEND_URL') . '/internships')->with('info', 'Payment cancelled. You can try again using the link in your email.');
    }
}
