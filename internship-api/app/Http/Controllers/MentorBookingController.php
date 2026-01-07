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

class MentorBookingController extends Controller
{
    /**
     * Initiate Paystack payment for mentorship session
     */
    public function initiatePayment(Request $request)
    {
        $request->validate([
            'mentor_id' => 'required|exists:mentors,id',
            'student_name' => 'required|string|max:255',
            'student_email' => 'required|email|max:255',
            'student_phone' => 'nullable|string|max:20',
            'scheduled_at' => 'required|date|after:now',
        ]);

        $mentor = Mentor::findOrFail($request->mentor_id);
        $scheduledAt = $request->scheduled_at;

        // Check for exact time conflict
        $conflict = MentorBooking::where('mentor_id', $mentor->id)
            ->where('status', 'paid')
            ->where('scheduled_at', $scheduledAt)
            ->exists();

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => 'This time slot is already booked. Please choose another time.'
            ], 400);
        }

        $reference = 'mentorbk_' . uniqid() . time();

        $payload = [
            "amount" => $mentor->session_price * 100,
            "reference" => $reference,
            "email" => $request->student_email,
            "currency" => "GHS",
            "callback_url" => route('mentor.booking.callback'),
            "metadata" => [
                'mentor_id' => $mentor->id,
                'student_name' => $request->student_name,
                'student_phone' => $request->student_phone,
                'scheduled_at' => $request->scheduled_at,
            ]
        ];

        $response = Http::withToken(config('services.paystack.secret_key'))
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post('https://api.paystack.co/transaction/initialize', $payload);

        if ($response->successful() && $response->json('status') === true) {
            return response()->json([
                'success' => true,
                'authorization_url' => $response->json('data.authorization_url'),
                'reference' => $reference,
            ]);
        }

        Log::error('Paystack initialization failed', ['response' => $response->body()]);

        return response()->json([
            'success' => false,
            'message' => 'Failed to initialize payment. Please try again.'
        ], 500);
    }

    /**
     * Get available time slots for a mentor on a specific date
     */
    public function getAvailableSlots(Request $request, $uuid)
    {
        $request->validate(['date' => 'required|date_format:Y-m-d']);

        $mentor = Mentor::where('uuid', $uuid)->firstOrFail();
        $date = $request->date;
        $dayOfWeek = strtolower(Carbon::parse($date)->format('l')); // e.g. "monday"

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
    /**
     * Handle Paystack callback after payment
     */
    public function handleCallback(Request $request)
    {
        $reference = $request->query('reference');

        if (!$reference) {
            return redirect('/?booking=failed');
        }

        $verify = Http::withToken(config('services.paystack.secret_key'))
            ->get("https://api.paystack.co/transaction/verify/{$reference}");

        if (!$verify->successful()) {
            Log::error('Paystack verification failed', ['response' => $verify->body()]);
            return redirect('/?booking=failed');
        }

        $result = $verify->json();

        if ($result['status'] !== true || $result['data']['status'] !== 'success') {
            return redirect('/?booking=failed');
        }

        $data = $result['data'];
        $metadata = $data['metadata'];

        try {
            $mentor = Mentor::findOrFail($metadata['mentor_id']);

            if (($data['amount'] / 100) != $mentor->session_price) {
                Log::warning('Payment amount mismatch detected', [
                    'reference' => $reference,
                    'expected' => $mentor->session_price,
                    'received' => $data['amount'] / 100
                ]);
                return redirect('/?booking=failed');
            }

            $scheduledAtUtc = Carbon::parse($metadata['scheduled_at'])
                ->timezone('UTC')
                ->format('Y-m-d\TH:i:s\Z');

            $zoom = $this->createZoomMeeting($mentor, $scheduledAtUtc);

            $booking = MentorBooking::create([
                'mentor_id' => $mentor->id,
                'student_name' => $metadata['student_name'],
                'student_email' => $data['customer']['email'],
                'student_phone' => $metadata['student_phone'] ?? null,
                'scheduled_at' => $metadata['scheduled_at'],
                'paystack_reference' => $reference,
                'amount' => $mentor->session_price,
                'zoom_meeting_id' => $zoom['id'] ?? null,
                'zoom_join_url' => $zoom['join_url'] ?? null,
                'zoom_start_url' => $zoom['start_url'] ?? null,
                'status' => 'paid',
            ]);

            Mail::to($booking->student_email)->send(new MentorBookingConfirmed($booking));

            if ($mentor->zoom_email) {
                Mail::to($mentor->zoom_email)->send(new MentorNewBooking($booking));
            }

            return redirect('/?booking=success');
        } catch (\Exception $e) {
            Log::error('Booking processing failed', [
                'reference' => $reference,
                'error' => $e->getMessage()
            ]);

            return redirect('/?booking=failed');
        }
    }

    private function createZoomMeeting($mentor, $scheduledAt)
    {
        if (!$mentor->zoom_email) {
            Log::warning("Mentor {$mentor->name} (ID: {$mentor->id}) has no Zoom email configured.");
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
                Log::error('Zoom token request failed', ['response' => $tokenResponse->body()]);
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
                    "alternative_hosts" => ""
                ]
            ];

            $meetingResponse = Http::withToken($accessToken)
                ->withHeader('Content-Type', 'application/json')
                ->post("https://api.zoom.us/v2/users/{$mentor->zoom_email}/meetings", $payload);

            if (!$meetingResponse->successful()) {
                Log::error('Zoom meeting creation failed', [
                    'mentor_email' => $mentor->zoom_email,
                    'response' => $meetingResponse->body()
                ]);
                return ['id' => null, 'join_url' => null, 'start_url' => null];
            }

            $meetingData = $meetingResponse->json();

            return [
                'id' => $meetingData['id'],
                'join_url' => $meetingData['join_url'],
                'start_url' => $meetingData['start_url'],
            ];
        } catch (\Exception $e) {
            Log::error('Exception in Zoom meeting creation', ['error' => $e->getMessage()]);
            return ['id' => null, 'join_url' => null, 'start_url' => null];
        }
    }
}
