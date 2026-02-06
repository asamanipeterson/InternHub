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
            'first_name'            => 'required|string|max:100',
            'middle_name'           => 'nullable|string|max:100',
            'last_name'             => 'required|string|max:100',
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

        // Logic to combine name
        $fullName = trim($validated['first_name'] . ' ' . ($validated['middle_name'] ?? '') . ' ' . $validated['last_name']);
        $fullName = str_replace('  ', ' ', $fullName); // Remove double spaces

        $user = User::create([
            'name'          => $fullName, // Combined Name
            'first_name'    => $validated['first_name'],
            'middle_name'   => $validated['middle_name'] ?? null,
            'last_name'     => $validated['last_name'],
            'email'         => $validated['email'],
            'user_type'     => 'mentor',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('mentors', 'public');
            $imagePath = 'storage/' . $path;
        }

        $mentor = Mentor::create([
            'user_id'               => $user->id,
            'name'                  => $fullName, // Set on mentor as well if column exists
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
        $mentor = Mentor::where('user_id', $request->user()->id)->with('user')->first();
        if (!$mentor) {
            return response()->json(['message' => 'Mentor not found'], 404);
        }

        $tokenStatus = 'valid';

        // If a refresh token exists, verify it's actually working
        if (!empty($mentor->google_refresh_token)) {
            $client = new GoogleClient();
            $client->setClientId(config('services.google.client_id'));
            $client->setClientSecret(config('services.google.client_secret'));

            try {
                // Attempt to fetch a new access token using the stored refresh token
                $newToken = $client->fetchAccessTokenWithRefreshToken($mentor->google_refresh_token);

                if (isset($newToken['error'])) {
                    $tokenStatus = 'invalid';
                    Log::warning("Mentor ID {$mentor->id} has an invalid Google token: " . ($newToken['error_description'] ?? $newToken['error']));
                }
            } catch (\Exception $e) {
                $tokenStatus = 'invalid';
            }
        } else {
            $tokenStatus = 'unconnected';
        }

        return response()->json([
            'id'                  => $mentor->id,
            'uuid'                => $mentor->uuid,
            'name'                => $mentor->user->name,
            'first_name'          => $mentor->user->first_name,
            'middle_name'         => $mentor->user->middle_name,
            'last_name'           => $mentor->user->last_name,
            'title'               => $mentor->title,
            'is_google_connected' => !empty($mentor->google_refresh_token),
            'google_token_status' => $tokenStatus, // <--- The frontend now uses this flag
        ]);
    }

    public function connectGoogle(Request $request)
    {
        $mentor = Mentor::where('user_id', $request->user()->id)->first();
        if (!$mentor) {
            return response()->json(['error' => 'Mentor not found'], 404);
        }

        $client = new GoogleClient();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(config('services.google.redirect'));
        $client->addScope(GoogleCalendar::CALENDAR_EVENTS);
        $client->setAccessType('offline');
        $client->setPrompt('consent select_account');
        $client->setState((string) $mentor->id);

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
                    'google_access_token'     => $token['access_token'] ?? null,
                    'google_refresh_token'    => $token['refresh_token'] ?? $mentor->google_refresh_token,
                    'google_token_expires_in' => $token['expires_in'] ?? null,
                    'google_token_created_at' => now(),
                ]);

                return redirect(config('app.frontend_url') . '/mentor/dashboard?google=success');
            }
        } catch (\Exception $e) {
            Log::error('Google OAuth callback failed: ' . $e->getMessage());
        }

        return redirect(config('app.frontend_url') . '/mentor/dashboard?google=error');
    }

    public function update(Request $request, Mentor $mentor)
    {
        $validated = $request->validate([
            'first_name'            => 'nullable|string|max:100',
            'middle_name'           => 'nullable|string|max:100',
            'last_name'             => 'nullable|string|max:100',
            'email'                 => 'nullable|email|max:255|unique:users,email,' . $mentor->user->id,
            'title'                 => 'required|string|max:255',
            'specialization'        => 'nullable|string|max:255',
            'bio'                   => 'nullable|string',
            'image'                 => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'experience'            => 'required|integer|min:0',
            'rating'                => 'required|numeric|min:0|max:5',
            'session_price'         => 'required|numeric|min:0',
            'google_calendar_email' => 'nullable|email|max:255',
        ]);

        if ($request->hasFile('image')) {
            if ($mentor->image && Storage::disk('public')->exists(str_replace('storage/', '', $mentor->image))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $mentor->image));
            }
            $path = $request->file('image')->store('mentors', 'public');
            $validated['image'] = 'storage/' . $path;
        }

        $mentor->update($validated);

        if ($mentor->user) {
            $f = $validated['first_name'] ?? $mentor->user->first_name;
            $m = $validated['middle_name'] ?? $mentor->user->middle_name;
            $l = $validated['last_name'] ?? $mentor->user->last_name;

            $fullName = trim($f . ' ' . ($m ?? '') . ' ' . $l);
            $fullName = str_replace('  ', ' ', $fullName);

            $mentor->user->update([
                'name'        => $fullName,
                'email'       => $validated['email'] ?? $mentor->user->email,
                'first_name'  => $f,
                'middle_name' => $m,
                'last_name'   => $l,
            ]);

            // Sync name back to mentor table if column exists
            $mentor->update(['name' => $fullName]);
        }

        return response()->json($mentor->load('user'));
    }

    public function show($uuid)
    {
        $mentor = Mentor::with('user')->where('uuid', $uuid)->first();
        if (!$mentor) {
            return response()->json(['message' => 'Mentor not found'], 404);
        }
        return response()->json($mentor);
    }

    public function destroy(Mentor $mentor)
    {
        if ($mentor->image && Storage::disk('public')->exists(str_replace('storage/', '', $mentor->image))) {
            Storage::disk('public')->delete(str_replace('storage/', '', $mentor->image));
        }
        if ($mentor->user) {
            $mentor->user->delete();
        }
        $mentor->delete();
        return response()->json(null, 204);
    }
}
