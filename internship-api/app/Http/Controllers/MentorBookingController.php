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
use Google\Client as GoogleClient;
use Google\Service\Calendar as GoogleCalendar;
use Google\Service\Calendar\Event as GoogleEvent;
use Google\Service\Exception as GoogleServiceException;

class MentorBookingController extends Controller
{
    /**
     * Initiate mentorship booking and start Paystack payment
     */
    public function initiatePayment(Request $request)
    {
        $validated = $request->validate([
            'mentor_id'           => 'required|exists:mentors,id',
            'first_name'          => 'required|string|max:100',
            'last_name'           => 'required|string|max:100',
            'student_email'       => 'required|email|max:255',
            'phone'               => 'required|string|max:30',
            'date_of_birth'       => 'required|date|before:-13 years',
            'student_institution' => 'required|string|max:255',
            'student_course'      => 'required|string|max:255',
            'student_level'       => 'required|string|max:100',
            'topic_description'   => 'required|string|max:2000',
            'scheduled_at'        => 'required|date|after:now',
        ]);

        $mentor = Mentor::findOrFail($validated['mentor_id']);
        $scheduledAt = $validated['scheduled_at'];

        $user = Auth::user();

        if ($user) {
            $validated['first_name']    = $user->first_name ?? $validated['first_name'];
            $validated['last_name']     = $user->last_name ?? $validated['last_name'];
            $validated['student_email'] = $user->email;
        }

        $conflict = MentorBooking::where('mentor_id', $mentor->id)
            ->whereIn('status', ['paid', 'pending'])
            ->where('scheduled_at', $scheduledAt)
            ->where(function ($q) {
                $q->where('status', 'paid')
                    ->orWhere('payment_expires_at', '>=', Carbon::now());
            })->exists();

        if ($conflict) {
            return response()->json(['success' => false, 'message' => 'Time slot already reserved.'], 409);
        }

        $reference = 'mentorbk_' . uniqid() . time();

        $booking = MentorBooking::create([
            'mentor_id'             => $mentor->id,
            'user_id'               => $user ? $user->id : null,
            'student_name'          => $validated['first_name'] . ' ' . $validated['last_name'],
            'first_name'            => $validated['first_name'],
            'last_name'             => $validated['last_name'],
            'student_email'         => $validated['student_email'],
            'phone'                 => $validated['phone'],
            'date_of_birth'         => $validated['date_of_birth'],
            'student_institution'   => $validated['student_institution'],
            'student_course'        => $validated['student_course'],
            'student_level'         => $validated['student_level'],
            'topic_description'     => $validated['topic_description'],
            'scheduled_at'          => $scheduledAt,
            'paystack_reference'    => $reference,
            'amount'                => $mentor->session_price,
            'currency'              => 'GHS',
            'status'                => 'pending',
            'payment_expires_at'    => Carbon::now()->addHours(24),
        ]);

        $payload = [
            "amount"       => (int)($mentor->session_price * 100),
            "reference"    => $reference,
            "email"        => $validated['student_email'],
            "currency"     => "GHS",
            "callback_url" => route('payment.callback'),
            "metadata"     => [
                'mentor_id'   => $mentor->id,
                'booking_id'  => $booking->id,
                'type'        => 'mentorship',
                'user_id'     => $user?->id,
            ]
        ];

        $response = Http::withToken(config('services.paystack.secret_key'))
            ->post('https://api.paystack.co/transaction/initialize', $payload);

        if (!$response->successful()) {
            $booking->delete();
            Log::error('Paystack init failed', ['response' => $response->json()]);
            return response()->json(['success' => false, 'message' => 'Payment initialization failed'], 500);
        }

        $data = $response->json();

        return response()->json([
            'success'           => true,
            'authorization_url' => $data['data']['authorization_url'] ?? null,
            'reference'         => $reference,
            'booking_id'        => $booking->id,
        ]);
    }

    public function handleCallback(Request $request)
    {
        $reference = $request->query('reference');

        if (!$reference) {
            return redirect(config('app.frontend_url') . '/mentorship?booking=failed');
        }

        $verify = Http::withToken(config('services.paystack.secret_key'))
            ->get("https://api.paystack.co/transaction/verify/{$reference}");

        if ($verify->successful() && $verify->json('data.status') === 'success') {
            $data = $verify->json('data');
            $booking = MentorBooking::where('paystack_reference', $reference)->first();

            if ($booking) {
                return $this->processSuccessfulPayment($data, $booking);
            }
        }

        return redirect(config('app.frontend_url') . '/mentorship?booking=failed');
    }

    public function processSuccessfulPayment(array $data, MentorBooking $booking = null)
    {
        if (!$booking) {
            $reference = $data['reference'] ?? null;
            $booking = MentorBooking::where('paystack_reference', $reference)->first();
        }

        if (!$booking || $booking->status === 'paid') {
            if (request()->isMethod('post')) {
                return response()->json(['success' => true]);
            }
            return redirect(config('app.frontend_url') . '/mentorship/booked?booking=already_paid');
        }

        $mentor = Mentor::findOrFail($booking->mentor_id);

        // Try to generate Google Meet link
        $meetLink = $this->createGoogleMeetEvent($mentor, $booking);

        // Update booking (Link will be NULL if Google failed, allowing you to handle it)
        $booking->update([
            'status'           => 'paid',
            'google_meet_link' => $meetLink,
        ]);

        try {
            Mail::to($booking->student_email)->queue(new MentorBookingConfirmed($booking));
            $mentorEmail = $mentor->user->email ?? $mentor->email ?? null;
            if ($mentorEmail) {
                Mail::to($mentorEmail)->queue(new MentorNewBooking($booking));
            }
        } catch (\Exception $e) {
            Log::error("Mentorship email queue failed", ['error' => $e->getMessage()]);
        }

        if (request()->isMethod('post')) {
            return response()->json(['success' => true]);
        }

        $formattedDate = $booking->scheduled_at ? Carbon::parse($booking->scheduled_at)->format('Y-m-d H:i') : 'N/A';

        $query = http_build_query([
            'booking'  => 'success',
            'meetLink' => $meetLink ?? 'Link generation failed - Mentor needs to reconnect Google',
            'date'     => $formattedDate,
        ]);

        return redirect(config('app.frontend_url') . '/mentorship/booked?' . $query);
    }

    private function createGoogleMeetEvent(Mentor $mentor, MentorBooking $booking)
    {
        // 1. Validate mentor has a token (Mentor Model handles decryption automatically)
        if (!$mentor->google_refresh_token) {
            Log::warning("Google Meet: Mentor has no refresh token", ['mentor_id' => $mentor->id]);
            return null;
        }

        $client = new GoogleClient();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setAccessType('offline');

        // 2. Set the current access token
        $client->setAccessToken([
            'access_token'  => $mentor->google_access_token,
            'refresh_token' => $mentor->google_refresh_token,
            'expires_in'    => $mentor->google_token_expires_in ?? 3600,
            'created'       => $mentor->google_token_created_at?->timestamp ?? (time() - 3600),
        ]);

        // 3. Refresh if expired
        if ($client->isAccessTokenExpired()) {
            try {
                // IMPORTANT: Pass the decrypted token to Google
                $newToken = $client->fetchAccessTokenWithRefreshToken($mentor->google_refresh_token);

                if (isset($newToken['error'])) {
                    Log::error("Google token refresh failed", ['mentor' => $mentor->id, 'error' => $newToken['error']]);
                    return null;
                }

                // Update model (Mutators in Mentor.php will re-encrypt these automatically)
                $mentor->google_access_token     = $newToken['access_token'];
                if (isset($newToken['refresh_token'])) {
                    $mentor->google_refresh_token = $newToken['refresh_token'];
                }
                $mentor->google_token_expires_in = $newToken['expires_in'] ?? 3600;
                $mentor->google_token_created_at = now();
                $mentor->save();
            } catch (\Exception $e) {
                Log::error("Google refresh exception", ['error' => $e->getMessage()]);
                return null;
            }
        }

        $service = new GoogleCalendar($client);
        $startTime = Carbon::parse($booking->scheduled_at);
        $endTime   = $startTime->copy()->addHour();

        $studentFullName = $booking->student_name ?? ($booking->first_name . ' ' . $booking->last_name);

        $event = new GoogleEvent([
            'summary'     => "Mentorship Session: {$studentFullName}",
            'description' => "Discussion Topic: " . ($booking->topic_description ?: 'Not specified'),
            'start'       => ['dateTime' => $startTime->toRfc3339String(), 'timeZone' => 'Africa/Accra'],
            'end'         => ['dateTime' => $endTime->toRfc3339String(), 'timeZone' => 'Africa/Accra'],
            'attendees'   => [
                ['email' => $booking->student_email],
                ['email' => $mentor->user?->email ?? $mentor->email],
            ],
            'conferenceData' => [
                'createRequest' => [
                    'requestId'             => 'meet-' . $booking->id . '-' . time(),
                    'conferenceSolutionKey' => ['type' => 'hangoutsMeet'],
                ]
            ],
        ]);

        try {
            $createdEvent = $service->events->insert('primary', $event, [
                'conferenceDataVersion' => 1,
                'sendUpdates'           => 'all',
            ]);

            return $createdEvent->getHangoutLink();
        } catch (\Exception $e) {
            Log::error("Google Meet creation failed", ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function getAvailableSlots(Request $request, $uuid)
    {
        $request->validate(['date' => 'required|date_format:Y-m-d']);
        $mentor = Mentor::where('uuid', $uuid)->firstOrFail();
        $date = $request->date;
        $dayOfWeek = strtolower(Carbon::parse($date)->format('l'));

        $availabilities = $mentor->availabilities()->where('day_of_week', $dayOfWeek)->get();
        if ($availabilities->isEmpty()) return response()->json([]);

        $bookedTimes = MentorBooking::where('mentor_id', $mentor->id)
            ->whereDate('scheduled_at', $date)
            ->whereIn('status', ['paid', 'pending'])
            ->pluck('scheduled_at')
            ->map(fn($dt) => Carbon::parse($dt)->format('H:i'))
            ->toArray();

        $slots = [];
        foreach ($availabilities as $avail) {
            $current = Carbon::parse($avail->start_time);
            $end     = Carbon::parse($avail->end_time);
            while ($current->copy()->addHour() <= $end) {
                $time = $current->format('H:i');
                if (!in_array($time, $bookedTimes)) $slots[] = $time;
                $current->addHour();
            }
        }
        return response()->json(array_values(array_unique($slots)));
    }

    public function getMentorBookings(Request $request)
    {
        $mentor = Mentor::where('user_id', $request->user()->id)->first();
        if (!$mentor) return response()->json(['message' => 'Mentor profile not found'], 404);

        $bookings = MentorBooking::where('mentor_id', $mentor->id)->latest()->get()->map(function ($b) {
            return [
                'id'              => $b->id,
                'student'         => [
                    'name'              => $b->student_name ?: ($b->first_name . ' ' . $b->last_name),
                    'email'             => $b->student_email,
                    'phone'             => $b->phone,
                    'university'        => $b->student_institution,
                    'course'            => $b->student_course,
                    'level'             => $b->student_level,
                    'dob'               => $b->date_of_birth,
                    'topic_description' => $b->topic_description,
                ],
                'scheduled_at'      => $b->scheduled_at ? Carbon::parse($b->scheduled_at)->toDateTimeString() : null,
                'status'            => $b->status,
                'google_meet_link'  => $b->google_meet_link,
            ];
        });
        return response()->json($bookings);
    }

    public function getAdminBookings()
    {
        return response()->json(MentorBooking::with(['mentor.user'])->where('status', 'paid')->latest()->get());
    }

    public function studentBookings(Request $request)
    {
        $user = $request->user();
        $bookings = MentorBooking::where('student_email', $user->email)->with('mentor.user')->latest()->get()->map(function ($booking) {
            return [
                'id' => $booking->id,
                'mentor' => [
                    'name' => $booking->mentor->user ? $booking->mentor->user->first_name . ' ' . $booking->mentor->user->last_name : 'Mentor',
                    'image' => $booking->mentor->image ? asset('storage/' . $booking->mentor->image) : null,
                ],
                'scheduled_at' => $booking->scheduled_at,
                'topic_description' => $booking->topic_description,
                'google_meet_link' => $booking->google_meet_link,
                'status' => $booking->status,
            ];
        });
        return response()->json($bookings);
    }
}
