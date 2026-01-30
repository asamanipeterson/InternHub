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

        // Check for time slot conflict
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

        // FIXED: Added student_name to resolve the SQL General Error 1364
        $booking = MentorBooking::create([
            'mentor_id'             => $mentor->id,
            'user_id'               => Auth::id(),
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
                'type'        => 'mentorship'
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

    /**
     * Paystack callback (redirect after payment) - for mentorship
     */
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

    /**
     * Webhook handler
     */
    public function handleWebhook(Request $request)
    {
        return response()->json(['status' => 'deprecated - use /payment/webhook'], 200);
    }

    /**
     * Process successful payment (called from webhook or callback)
     */
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

        // Generate Google Meet link
        $meetLink = $this->createGoogleMeetEvent($mentor, $booking);

        // Update booking
        $booking->update([
            'status'           => 'paid',
            'google_meet_link' => $meetLink,
        ]);

        // Send confirmation emails
        try {
            Mail::to($booking->student_email)->queue(new MentorBookingConfirmed($booking));

            $mentorEmail = $mentor->user->email ?? $mentor->email ?? null;
            if ($mentorEmail) {
                Mail::to($mentorEmail)->queue(new MentorNewBooking($booking));
            }
        } catch (\Exception $e) {
            Log::error("Mentorship email queue failed", ['error' => $e->getMessage()]);
        }

        // Response handling
        if (request()->isMethod('post')) {
            return response()->json(['success' => true]);
        }

        // Use Carbon properly to avoid Syntax/ParseErrors
        $formattedDate = 'N/A';
        if ($booking->scheduled_at) {
            $formattedDate = Carbon::parse($booking->scheduled_at)->format('Y-m-d H:i');
        }

        // callback redirect
        $query = http_build_query([
            'booking'  => 'success',
            'meetLink' => $meetLink ?? 'Link generation failed - contact support',
            'date'     => $formattedDate,
        ]);

        return redirect(config('app.frontend_url') . '/mentorship/booked?' . $query);
    }

    /**
     * Create Google Calendar event + Meet link
     */
    private function createGoogleMeetEvent(Mentor $mentor, MentorBooking $booking)
    {
        if (!$mentor->google_refresh_token) {
            Log::warning("Mentor has no Google refresh token", ['mentor_id' => $mentor->id]);
            return null;
        }

        $client = new GoogleClient();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(config('services.google.redirect_uri'));
        $client->addScope(GoogleCalendar::CALENDAR_EVENTS);

        // Ensure we are working with timestamps for Carbon
        $createdTimestamp = $mentor->google_token_created_at instanceof Carbon
            ? $mentor->google_token_created_at->timestamp
            : (is_string($mentor->google_token_created_at) ? strtotime($mentor->google_token_created_at) : time() - 3600);

        $accessToken = [
            'access_token'  => $mentor->google_access_token,
            'refresh_token' => $mentor->google_refresh_token,
            'expires_in'    => $mentor->google_token_expires_in ?? 3600,
            'created'       => $createdTimestamp,
        ];

        $client->setAccessToken($accessToken);

        if ($client->isAccessTokenExpired()) {
            try {
                $newToken = $client->fetchAccessTokenWithRefreshToken($mentor->google_refresh_token);

                if (isset($newToken['error'])) {
                    Log::error("Google token refresh failed", ['error' => $newToken['error_description'] ?? $newToken['error']]);
                    return null;
                }

                $mentor->update([
                    'google_access_token'     => $newToken['access_token'],
                    'google_refresh_token'    => $newToken['refresh_token'] ?? $mentor->google_refresh_token,
                    'google_token_expires_in' => $newToken['expires_in'] ?? 3600,
                    'google_token_created_at' => now(),
                ]);
            } catch (\Exception $e) {
                Log::error("Google refresh exception", ['error' => $e->getMessage()]);
                return null;
            }
        }

        $service = new GoogleCalendar($client);

        $startTime = Carbon::parse($booking->scheduled_at);
        $endTime   = $startTime->copy()->addHours(1);

        // Ensure name fallbacks exist
        $studentFullName = $booking->student_name ?? ($booking->first_name . ' ' . $booking->last_name);
        $dobFormatted = $booking->date_of_birth ? Carbon::parse($booking->date_of_birth)->format('d M Y') : 'N/A';

        $event = new GoogleEvent([
            'summary'     => "Mentorship Session: {$studentFullName} with " . ($mentor->name ?? 'Mentor'),
            'description' => "Student: {$studentFullName} ({$booking->student_email})\n" .
                "Phone: {$booking->phone}\n" .
                "Date of Birth: {$dobFormatted}\n" .
                "Institution: {$booking->student_institution}\n" .
                "Course: {$booking->student_course}\n" .
                "Level: {$booking->student_level}\n\n" .
                "Discussion Topic / Goal:\n" .
                ($booking->topic_description ?: 'Not specified') . "\n\n" .
                "Session scheduled for: " . $startTime->format('D, d M Y @ H:i') . " GMT",
            'start'       => [
                'dateTime' => $startTime->toRfc3339String(),
                'timeZone' => 'Africa/Accra',
            ],
            'end'         => [
                'dateTime' => $endTime->toRfc3339String(),
                'timeZone' => 'Africa/Accra',
            ],
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
            $createdEvent = $service->events->insert(
                'primary',
                $event,
                [
                    'conferenceDataVersion' => 1,
                    'sendUpdates'           => 'all',
                ]
            );

            return $createdEvent->getHangoutLink();
        } catch (GoogleServiceException $e) {
            Log::error("Google Calendar API error", ['message' => $e->getMessage()]);
            return null;
        } catch (\Exception $e) {
            Log::error("Unexpected error creating Meet event", ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Get available time slots for a mentor on a specific date
     */
    public function getAvailableSlots(Request $request, $uuid)
    {
        $request->validate(['date' => 'required|date_format:Y-m-d']);

        $mentor = Mentor::where('uuid', $uuid)->firstOrFail();
        $date = $request->date;
        $dayOfWeek = strtolower(Carbon::parse($date)->format('l'));

        $availabilities = $mentor->availabilities()->where('day_of_week', $dayOfWeek)->get();

        if ($availabilities->isEmpty()) {
            return response()->json([]);
        }

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
                if (!in_array($time, $bookedTimes)) {
                    $slots[] = $time;
                }
                $current->addHour();
            }
        }

        return response()->json(array_values(array_unique($slots)));
    }

    /**
     * Get bookings for the authenticated mentor
     */
    public function getMentorBookings(Request $request)
    {
        $mentor = Mentor::where('user_id', $request->user()->id)->first();

        if (!$mentor) {
            return response()->json(['message' => 'Mentor profile not found'], 404);
        }

        $bookings = MentorBooking::where('mentor_id', $mentor->id)
            ->latest()
            ->get()
            ->map(function ($b) {
                return [
                    'id'              => $b->id,
                    'student'         => [
                        'name'              => $b->student_name ?: ($b->first_name . ' ' . $b->last_name),
                        'email'             => $b->student_email,
                        'phone'             => $b->phone,
                        'dob'                => $b->date_of_birth, // ADD THIS LINE
                        'university'        => $b->student_institution,
                        'course'            => $b->student_course,
                        'level'             => $b->student_level,
                        'topic_description' => $b->topic_description,
                    ],
                    'scheduled_at'      => $b->scheduled_at ? \Carbon\Carbon::parse($b->scheduled_at)->toDateTimeString() : null,
                    'status'            => $b->status,
                    'google_meet_link'  => $b->google_meet_link,
                ];
            });

        return response()->json($bookings);
    }
    /**
     * Admin: Get all paid mentorship bookings
     */
    public function getAdminBookings()
    {
        return response()->json(
            MentorBooking::with(['mentor.user']) // This loads the mentor AND the user linked to it
                ->where('status', 'paid')
                ->latest()
                ->get()
        );
    }
}
