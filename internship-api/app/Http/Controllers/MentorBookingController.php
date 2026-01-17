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
            "amount"       => $mentor->session_price * 100, // kobo/pesewas
            "reference"    => $reference,
            "email"        => $validated['student_email'],
            "currency"     => "GHS",
            "callback_url" => route('payment.callback'), // or a mentorship-specific callback if needed
            "metadata"     => [
                'mentor_id'   => $mentor->id,
                'booking_id'  => $booking->id,
                'type'        => 'mentorship' // optional extra identifier
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
                $this->processSuccessfulPayment($data, $booking);
                // Redirect handled inside processSuccessfulPayment
            } else {
                return redirect(config('app.frontend_url') . '/mentorship?booking=failed');
            }
        } else {
            return redirect(config('app.frontend_url') . '/mentorship?booking=failed');
        }
    }

    /**
     * Webhook handler → now in PaymentController (unified)
     * This method is kept for reference / backward compatibility if needed
     */
    public function handleWebhook(Request $request)
    {
        // Deprecated / moved to PaymentController
        // You can remove this route entirely now
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
        if (request()->isMethod('post')) { // webhook
            return response()->json(['success' => true]);
        }

        // callback redirect
        $query = http_build_query([
            'booking'  => 'success',
            'meetLink' => $meetLink ?? 'Link generation failed - contact support',
            'date'     => $booking->scheduled_at?->format('Y-m-d H:i') ?? 'N/A',
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

        $accessToken = [
            'access_token'  => $mentor->google_access_token,
            'refresh_token' => $mentor->google_refresh_token,
            'expires_in'    => $mentor->google_token_expires_in ?? 3600,
            'created'       => $mentor->google_token_created_at?->timestamp ?? time() - 3600,
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
        $endTime   = $startTime->copy()->addMinutes(45);

        $event = new GoogleEvent([
            'summary'     => "Mentorship: {$booking->student_name} with {$mentor->name}",
            'description' => "Student: {$booking->student_name} ({$booking->student_email})\nUniversity: {$booking->student_university}\nCourse: {$booking->student_course}",
            'start'       => [
                'dateTime' => $startTime->toRfc3339String(),
                'timeZone' => 'Africa/Accra', // Ghana time
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
                    'sendUpdates'           => 'all', // notify attendees
                ]
            );

            $meetLink = $createdEvent->getHangoutLink();

            if (!$meetLink) {
                Log::warning("Google event created but no Meet link", [
                    'event_id' => $createdEvent->getId(),
                ]);
            }

            return $meetLink;
        } catch (GoogleServiceException $e) {
            Log::error("Google Calendar API error", [
                'message' => $e->getMessage(),
                'code'    => $e->getCode(),
                'errors'  => $e->getErrors(),
            ]);
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

            while ($current->copy()->addMinutes(45) <= $end) {
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
                        'name'       => $b->student_name,
                        'email'      => $b->student_email,
                        'phone'      => $b->student_phone,
                        'age'        => $b->age,                   // ← added
                        'university' => $b->student_university,
                        'course'     => $b->student_course,
                        'level'      => $b->student_level,
                    ],
                    'scheduled_at'    => $b->scheduled_at,
                    'status'          => $b->status,
                    'google_meet_link' => $b->google_meet_link,
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
            MentorBooking::with('mentor')->where('status', 'paid')->latest()->get()
        );
    }
}
