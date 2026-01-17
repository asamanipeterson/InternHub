<?php

namespace App\Http\Controllers;

use App\Models\Mentor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Notifications\MentorWelcomeSetPassword;
use Google\Client as GoogleClient;
use Google\Service\Calendar as GoogleCalendar;

class MentorController extends Controller
{
    public function index()
    {
        return response()->json(Mentor::with('user')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|max:255|unique:users,email',
            'title'                 => 'required|string|max:255',
            'specialization'        => 'nullable|string|max:255',
            'bio'                   => 'nullable|string',
            'image'                 => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'experience'            => 'required|integer|min:0',
            'rating'                => 'required|numeric|min:0|max:5',
            'session_price'         => 'required|numeric|min:0',
            'google_calendar_email' => 'nullable|email|max:255',
        ]);

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'user_type' => 'mentor',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('mentors', 'public');
            $imagePath = 'storage/' . $path;
        }

        $mentor = Mentor::create([
            'user_id'               => $user->id,
            'name'                  => $validated['name'],
            'title'                 => $validated['title'],
            'specialization'        => $validated['specialization'] ?? null,
            'bio'                   => $validated['bio'] ?? null,
            'image'                 => $imagePath,
            'experience'            => $validated['experience'],
            'rating'                => $validated['rating'],
            'session_price'         => $validated['session_price'],
            'google_calendar_email' => $validated['google_calendar_email'] ?? null,
        ]);

        $user->notify(new MentorWelcomeSetPassword());

        return response()->json($mentor->load('user'), 201);
    }

    public function profile(Request $request)
    {
        $mentor = Mentor::where('user_id', $request->user()->id)->first();
        if (!$mentor) return response()->json(['message' => 'Not found'], 404);

        return response()->json([
            'id'                  => $mentor->id,
            'uuid'                => $mentor->uuid,
            'name'                => $mentor->name,
            'title'               => $mentor->title,
            'is_google_connected' => !empty($mentor->google_refresh_token),
        ]);
    }

    public function connectGoogle(Request $request)
    {
        $mentor = Mentor::where('user_id', $request->user()->id)->first();
        if (!$mentor) return response()->json(['error' => 'Not found'], 404);

        $client = new GoogleClient();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(config('services.google.redirect'));
        $client->addScope(GoogleCalendar::CALENDAR_EVENTS);
        $client->setAccessType('offline');
        $client->setPrompt('consent');
        $client->setState((string)$mentor->id);

        return response()->json(['url' => $client->createAuthUrl()]);
    }

    public function handleGoogleCallback(Request $request)
    {
        $mentorId = $request->query('state');
        $code     = $request->query('code');

        if (!$mentorId || !$code) {
            return redirect(config('app.frontend_url') . '/mentor/dashboard?google=error');
        }

        $client = new GoogleClient();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(config('services.google.redirect'));

        try {
            $token = $client->fetchAccessTokenWithAuthCode($code);
            $mentor = Mentor::find($mentorId);
            if ($mentor) {
                $mentor->update([
                    'google_access_token'     => $token['access_token'],
                    'google_refresh_token'    => $token['refresh_token'] ?? $mentor->google_refresh_token,
                    'google_token_expires_in'  => $token['expires_in'],
                    'google_token_created_at'  => now(),
                ]);
                return redirect(config('app.frontend_url') . '/mentor/dashboard?google=success');
            }
        } catch (\Exception $e) {
            Log::error('Google OAuth failed: ' . $e->getMessage());
        }
        return redirect(config('app.frontend_url') . '/mentor/dashboard?google=error');
    }

    public function update(Request $request, Mentor $mentor)
    {
        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'title'                 => 'required|string|max:255',
            'experience'            => 'required|integer|min:0',
            'rating'                => 'required|numeric|min:0|max:5',
            'session_price'         => 'required|numeric|min:0',
            'google_calendar_email' => 'nullable|email|max:255',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('mentors', 'public');
            $validated['image'] = 'storage/' . $path;
        }

        $mentor->update($validated);
        return response()->json($mentor->load('user'));
    }

    public function show($uuid)
    {
        // Search by uuid column specifically
        $mentor = Mentor::with('user')->where('uuid', $uuid)->first();

        if (!$mentor) {
            return response()->json(['message' => 'Mentor not found'], 404);
        }

        return response()->json($mentor);
    }
    public function destroy(Mentor $mentor)
    {
        // Delete image if exists
        if ($mentor->image && Storage::disk('public')->exists(str_replace('storage/', '', $mentor->image))) {
            Storage::disk('public')->delete(str_replace('storage/', '', $mentor->image));
        }

        // Delete the linked user (cascade will handle relations if set)
        if ($mentor->user) {
            $mentor->user->delete();
        }

        $mentor->delete();

        return response()->json(null, 204);
    }
}
