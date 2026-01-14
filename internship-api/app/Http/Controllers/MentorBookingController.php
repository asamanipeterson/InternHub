<?php

namespace App\Http\Controllers;

use App\Models\Mentor;
use App\Models\MentorBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\MentorBookingConfirmed;
use App\Mail\MentorNewBooking;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class MentorBookingController extends Controller
{
    public function initiatePayment(Request $request)
    {
        $validated = $request->validate([
            'mentor_id'          => 'required|exists:mentors,id',
            'student_name'       => 'required|string|max:255',
            'student_email'      => 'required|email|max:255',
            'student_phone'      => 'nullable|string|max:30',
            'student_age'        => 'required|integer|min:13|max:120',
            'student_university' => 'required|string|max:255',
            'student_course'     => 'required|string|max:255',
            'student_level'      => 'required|string|max:100',
            'scheduled_at'       => 'required|date|after:now',
        ]);

        $mentor = Mentor::findOrFail($validated['mentor_id']);
        $scheduledAt = $validated['scheduled_at'];

        $conflict = MentorBooking::where('mentor_id', $mentor->id)
            ->whereIn('status', ['pending', 'paid'])
            ->where('scheduled_at', $scheduledAt)
            ->where(function ($q) {
                $q->where('status', 'paid')
                    ->orWhere('payment_expires_at', '>=', Carbon::now());
            })
            ->exists();

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => 'This time slot is already reserved. Please choose another time.'
            ], 409);
        }

        $reference = 'mentorbk_' . uniqid() . time();

        $booking = MentorBooking::create([
            'mentor_id'             => $mentor->id,
            'user_id'               => Auth::id(),
            'student_name'          => $validated['student_name'],
            'student_email'         => $validated['student_email'],
            'student_phone'         => $validated['student_phone'] ?? null,
            'age'                   => $validated['student_age'],
            'student_university'    => $validated['student_university'],
            'student_course'        => $validated['student_course'],
            'student_level'         => $validated['student_level'],
            'scheduled_at'          => $scheduledAt,
            'paystack_reference'    => $reference,
            'amount'                => $mentor->session_price,
            'currency'              => 'GHS',
            'status'                => 'pending',
            'payment_expires_at'    => Carbon::now()->addHours(24),
        ]);

        $payload = [
            "amount"       => $mentor->session_price * 100,
            "reference"    => $reference,
            "email"        => $validated['student_email'],
            "currency"     => "GHS",
            "callback_url" => route('mentor.booking.callback'),
            "metadata"     => [
                'mentor_id'          => $mentor->id,
                'booking_id'         => $booking->id,
                'student_name'       => $validated['student_name'],
                'student_email'      => $validated['student_email'],
                'student_phone'      => $validated['student_phone'] ?? null,
                'student_age'        => $validated['student_age'],
                'student_university' => $validated['student_university'],
                'student_course'     => $validated['student_course'],
                'student_level'      => $validated['student_level'],
                'scheduled_at'       => $scheduledAt,
                'reference'          => $reference,
            ]
        ];

        $response = Http::withToken(config('services.paystack.secret_key'))
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post('https://api.paystack.co/transaction/initialize', $payload);

        if (!$response->successful() || !$response->json('status')) {
            $booking->delete();
            Log::error('Paystack initialization failed', ['response' => $response->body()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize payment. Please try again.'
            ], 500);
        }

        $paymentData = $response->json('data');

        Log::info("Mentorship booking created & payment initiated", [
            'booking_id' => $booking->id,
            'reference'  => $reference,
            'user_id'    => Auth::id(),
            'expires_at' => $booking->payment_expires_at
        ]);

        return response()->json([
            'success'           => true,
            'authorization_url' => $paymentData['authorization_url'],
            'reference'         => $reference,
            'booking_id'        => $booking->id,
            'expires_at'        => $booking->payment_expires_at->toIso8601String(),
            'message'           => 'You have 24 hours to complete payment.'
        ]);
    }

    public function getAvailableSlots(Request $request, $uuid)
    {
        $request->validate(['date' => 'required|date_format:Y-m-d']);

        $mentor = Mentor::where('uuid', $uuid)->firstOrFail();
        $date = $request->date;
        $dayOfWeek = strtolower(Carbon::parse($date)->format('l'));

        $availabilities = $mentor->availabilities()
            ->where('day_of_week', $dayOfWeek)
            ->get();

        $bookedTimes = MentorBooking::where('mentor_id', $mentor->id)
            ->whereDate('scheduled_at', $date)
            ->where('status', 'paid')
            ->pluck('scheduled_at')
            ->map(fn($dt) => Carbon::parse($dt)->format('H:i'))
            ->toArray();

        $slots = [];

        foreach ($availabilities as $avail) {
            $current = Carbon::createFromFormat('H:i:s', $avail->start_time);
            $end = Carbon::createFromFormat('H:i:s', $avail->end_time);

            while ($current->copy()->addHour() <= $end) {
                $time = $current->format('H:i');
                if (!in_array($time, $bookedTimes)) {
                    $slots[] = $time;
                }
                $current->addHour();
            }
        }

        return response()->json(array_values(array_unique($slots)));
    }

    public function handleCallback(Request $request)
    {
        $reference = $request->query('reference');

        if (!$reference) {
            return redirect(env('FRONTEND_URL') . '/mentorship?booking=failed');
        }

        $verify = Http::withToken(config('services.paystack.secret_key'))
            ->get("https://api.paystack.co/transaction/verify/{$reference}");

        if (!$verify->successful()) {
            Log::error('Paystack verification failed', ['response' => $verify->body()]);
            return redirect(env('FRONTEND_URL') . '/mentorship?booking=failed');
        }

        $result = $verify->json();

        if ($result['status'] !== true || $result['data']['status'] !== 'success') {
            return redirect(env('FRONTEND_URL') . '/mentorship?booking=failed');
        }

        return $this->processSuccessfulPayment($result['data']);
    }

    public function handleWebhook(Request $request)
    {
        $secret = config('services.paystack.secret_key');
        $signature = $request->header('x-paystack-signature');

        if (!$signature) {
            return response()->json(['message' => 'No signature'], 400);
        }

        $payload = $request->getContent();
        $computed = hash_hmac('sha512', $payload, $secret);

        if (!hash_equals($computed, $signature)) {
            Log::warning('Invalid Paystack webhook signature');
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $event = $request->json()->all();

        Log::info('Paystack webhook received', ['event' => $event['event'] ?? 'unknown']);

        if ($event['event'] === 'charge.success') {
            $this->processSuccessfulPayment($event['data']);
        }

        return response()->json(['message' => 'Event handled'], 200);
    }

    private function processSuccessfulPayment(array $data)
    {
        $reference = $data['reference'];

        $booking = MentorBooking::where('paystack_reference', $reference)
            ->whereIn('status', ['pending', 'paid'])
            ->first();

        if (!$booking) {
            Log::warning("No pending booking found for reference: {$reference}");
            return redirect(env('FRONTEND_URL') . '/mentorship?booking=failed');
        }

        if ($booking->status === 'paid') {
            Log::info("Payment already processed for reference: {$reference}");
            return redirect(env('FRONTEND_URL') . '/mentorship/booked?booking=success');
        }

        if (Carbon::parse($booking->payment_expires_at)->isPast()) {
            $booking->update(['status' => 'expired']);
            Log::info("Booking expired before payment", ['reference' => $reference]);
            return redirect(env('FRONTEND_URL') . '/mentorship?booking=expired');
        }

        $mentor = Mentor::findOrFail($booking->mentor_id);

        if (($data['amount'] / 100) != $booking->amount) {
            Log::warning('Payment amount mismatch', [
                'reference' => $reference,
                'expected'  => $booking->amount,
                'received'  => $data['amount'] / 100
            ]);
            $booking->update(['status' => 'failed']);
            return redirect(env('FRONTEND_URL') . '/mentorship/booked?booking=failed');
        }

        $scheduledAtUtc = Carbon::parse($booking->scheduled_at)
            ->timezone('UTC')
            ->format('Y-m-d\TH:i:s\Z');

        $zoom = $this->createZoomMeeting($mentor, $scheduledAtUtc);

        $booking->update([
            'status'          => 'paid',
            'zoom_meeting_id' => $zoom['id'] ?? null,
            'zoom_join_url'   => $zoom['join_url'] ?? null,
            'zoom_start_url'  => $zoom['start_url'] ?? null,
        ]);


        Mail::to($booking->student_email)->queue(new MentorBookingConfirmed($booking));

        if ($mentor->zoom_email) {
            Mail::to($mentor->zoom_email)->queue(new MentorNewBooking($booking));
        }

        Log::info("Mentorship booking confirmed", [
            'reference'  => $reference,
            'booking_id' => $booking->id
        ]);

        $redirectUrl = env('FRONTEND_URL') . '/mentorship/booked?' . http_build_query([
            'booking'     => 'success',
            'mentorName'  => $mentor->name,
            'mentorTitle' => $mentor->title,
            'date'        => $booking->scheduled_at,
            'time'        => Carbon::parse($booking->scheduled_at)->format('H:i'),
            'zoomLink'    => $booking->zoom_join_url ?? 'No link available',
            'amount'      => $booking->amount,
        ]);

        return redirect($redirectUrl);
    }

    private function createZoomMeeting($mentor, $scheduledAt)
    {
        if (!$mentor->zoom_email) {
            Log::warning("Mentor {$mentor->name} has no Zoom email configured.");
            return ['id' => null, 'join_url' => null, 'start_url' => null];
        }

        try {
            $tokenResponse = Http::asForm()
                ->withBasicAuth(
                    config('services.zoom.client_id'),
                    config('services.zoom.client_secret')
                )
                ->post('https://zoom.us/oauth/token', [
                    'grant_type' => 'account_credentials',
                    'account_id' => config('services.zoom.account_id'),
                ]);

            if (!$tokenResponse->successful()) {
                Log::error('Zoom token failed', ['response' => $tokenResponse->body()]);
                return ['id' => null, 'join_url' => null, 'start_url' => null];
            }

            $accessToken = $tokenResponse->json('access_token');

            $payload = [
                "topic" => "Mentorship Session with {$mentor->name}",
                "type" => 2,
                "start_time" => $scheduledAt,
                "duration" => 45,
                "timezone" => "Africa/Accra",
                "settings" => [
                    "host_video" => true,
                    "participant_video" => true,
                    "join_before_host" => true,
                    "mute_upon_entry" => true,
                    "waiting_room" => false,
                    "approval_type" => 2,
                    "auto_recording" => "none",
                ]
            ];

            $meetingResponse = Http::withToken($accessToken)
                ->withHeader('Content-Type', 'application/json')
                ->post("https://api.zoom.us/v2/users/{$mentor->zoom_email}/meetings", $payload);

            if (!$meetingResponse->successful()) {
                Log::error('Zoom meeting creation failed', ['response' => $meetingResponse->body()]);
                return ['id' => null, 'join_url' => null, 'start_url' => null];
            }

            $meetingData = $meetingResponse->json();

            return [
                'id' => $meetingData['id'],
                'join_url' => $meetingData['join_url'],
                'start_url' => $meetingData['start_url'],
            ];
        } catch (\Exception $e) {
            Log::error('Zoom exception', ['error' => $e->getMessage()]);
            return ['id' => null, 'join_url' => null, 'start_url' => null];
        }
    }

    public function getAdminBookings(Request $request)
    {
        $bookings = MentorBooking::with('mentor')
            ->where('status', 'paid')
            ->latest()
            ->get()
            ->map(function ($booking) {
                return [
                    'id'                 => $booking->id,
                    'student_name'       => $booking->student_name,
                    'student_email'      => $booking->student_email,
                    'student_phone'      => $booking->student_phone,
                    'age'                => $booking->age,
                    'student_university' => $booking->student_university,
                    'student_course'     => $booking->student_course,
                    'student_level'      => $booking->student_level,
                    'mentor_name'        => $booking->mentor->name,
                    'mentor_title'       => $booking->mentor->title,
                    'scheduled_at'       => $booking->scheduled_at,
                    'date'               => Carbon::parse($booking->scheduled_at)->format('Y-m-d'),
                    'time'               => Carbon::parse($booking->scheduled_at)->format('H:i'),
                    'amount'             => $booking->amount,
                    'status'             => $booking->status,
                    'zoom_join_url'      => $booking->zoom_join_url,
                    'created_at'         => $booking->created_at,
                ];
            });

        return response()->json($bookings);
    }

    public function getAllMentorBookings()
    {
        $bookings = MentorBooking::with('mentor')
            ->latest()
            ->get()
            ->map(function ($booking) {
                return [
                    'id'                 => $booking->id,
                    'student_name'       => $booking->student_name,
                    'student_email'      => $booking->student_email,
                    'student_phone'      => $booking->student_phone,
                    'age'                => $booking->age,
                    'student_university' => $booking->student_university,
                    'student_course'     => $booking->student_course,
                    'student_level'      => $booking->student_level,
                    'mentor_name'        => $booking->mentor->name ?? 'N/A',
                    'mentor_title'       => $booking->mentor->title ?? 'N/A',
                    'scheduled_at'       => $booking->scheduled_at,
                    'status'             => $booking->status,
                    'payment_expires_at' => $booking->payment_expires_at?->toDateTimeString(),
                    'amount'             => $booking->amount,
                    'created_at'         => $booking->created_at,
                ];
            });

        return response()->json($bookings);
    }

    // Add this inside class MentorBookingController extends Controller

    public function getMentorBookings(Request $request)
    {
        // 1. Get the authenticated user
        $user = $request->user();

        // 2. Find the mentor record associated with this user
        // Assuming you have a 'user_id' column on your 'mentors' table
        $mentor = Mentor::where('user_id', $user->id)->first();

        if (!$mentor) {
            return response()->json(['message' => 'Mentor profile not found.'], 404);
        }

        // 3. Fetch bookings for this mentor
        $bookings = MentorBooking::where('mentor_id', $mentor->id)
            ->latest()
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'student' => [
                        'name' => $booking->student_name,
                        'email' => $booking->student_email,
                        'university' => $booking->student_university,
                        'course' => $booking->student_course,
                        'phone' => $booking->student_phone,
                    ],
                    'scheduled_at' => $booking->scheduled_at,
                    'status' => $booking->status,
                    'zoom_join_url' => $booking->zoom_join_url,
                ];
            });

        return response()->json($bookings);
    }
}
