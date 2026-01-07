<?php

namespace App\Http\Controllers;

use App\Models\Mentor;
use App\Models\MentorAvailability;
use Illuminate\Http\Request;

class MentorAvailabilityController extends Controller
{
    public function index(Mentor $mentor)
    {
        return response()->json($mentor->availabilities);
    }

    public function store(Request $request, Mentor $mentor)
    {
        $validated = $request->validate([
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $availability = $mentor->availabilities()->create($validated);

        return response()->json($availability, 201);
    }

    public function destroy(Mentor $mentor, MentorAvailability $availability)
    {
        if ($availability->mentor_id !== $mentor->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $availability->delete();

        return response()->json(null, 204);
    }
}
