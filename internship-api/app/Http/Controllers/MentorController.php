<?php

namespace App\Http\Controllers;

use App\Models\Mentor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Notifications\MentorWelcomeSetPassword;

class MentorController extends Controller
{
    /**
     * Display a listing of mentors (with user relation)
     */
    public function index()
    {
        return response()->json(Mentor::with('user')->get());
    }

    /**
     * Store a newly created mentor (admin only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|max:255|unique:users,email',
            'title'          => 'required|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'bio'            => 'nullable|string',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'experience'     => 'required|integer|min:0',
            'rating'         => 'required|numeric|min:0|max:5',
            'session_price'  => 'required|numeric|min:0',
            'zoom_email'     => 'nullable|email|max:255',
        ]);

        // Create the user account (no password yet - mentor sets it later)
        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'user_type' => 'mentor',
            // password is nullable now → no need to provide it
        ]);

        // Handle image upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('mentors', 'public');
            $imagePath = 'storage/' . $path;
        }

        // Create the mentor profile linked to the user
        $mentor = Mentor::create([
            'user_id'        => $user->id,
            'name'           => $validated['name'],
            'title'          => $validated['title'],
            'specialization' => $validated['specialization'] ?? null,
            'bio'            => $validated['bio'] ?? null,
            'image'          => $imagePath,
            'experience'     => $validated['experience'],
            'rating'         => $validated['rating'],
            'session_price'  => $validated['session_price'],
            'zoom_email'     => $validated['zoom_email'] ?? null,
        ]);

        // Send welcome email with OTP for setting password
        $user->notify(new MentorWelcomeSetPassword());

        // Return the created mentor with user relation
        return response()->json($mentor->load('user'), 201);
    }

    /**
     * Display the specified mentor
     */
    public function show(Mentor $mentor)
    {
        return response()->json($mentor->load('user'));
    }

    /**
     * Update the specified mentor
     */
    public function update(Request $request, Mentor $mentor)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'title'          => 'required|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'bio'            => 'nullable|string',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'experience'     => 'required|integer|min:0',
            'rating'         => 'required|numeric|min:0|max:5',
            'session_price'  => 'required|numeric|min:0',
            'zoom_email'     => 'nullable|email|max:255',
        ]);

        // Update linked user's name if changed
        if ($request->filled('name') && $mentor->user) {
            $mentor->user->update(['name' => $validated['name']]);
        }

        // Handle image update/replacement
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($mentor->image && Storage::disk('public')->exists(str_replace('storage/', '', $mentor->image))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $mentor->image));
            }

            $path = $request->file('image')->store('mentors', 'public');
            $validated['image'] = 'storage/' . $path;
        }

        $mentor->update($validated);

        return response()->json($mentor->load('user'));
    }

    /**
     * Remove the specified mentor (and linked user)
     */
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
