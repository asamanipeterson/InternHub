<?php

namespace App\Http\Controllers;

use App\Models\Mentor;
use App\Models\MentorAvailability;
use Illuminate\Http\Request;

class MentorAvailabilityController extends Controller
{
    /**
     * Get all availability slots for a specific mentor
     */
    public function index(Mentor $mentor)
    {
        return response()->json($mentor->availabilities()->orderBy('day_of_week')->get());
    }

    /**
     * Store or Update availability (Admin/Mentor)
     */
    public function store(Request $request, Mentor $mentor)
    {
        $validated = $request->validate([
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i|after:start_time',
        ]);

        // Prevention: Check if this exact slot already exists to avoid duplicates
        // or use updateOrCreate to simply update the times if the day is already set.
        $availability = $mentor->availabilities()->updateOrCreate(
            [
                'day_of_week' => $validated['day_of_week'],
                // Optional: only updateOrCreate if you want one slot per day.
                // If you allow multiple slots per day (e.g., Morning and Evening),
                // remove 'day_of_week' from here and use ->create() instead.
            ],
            $validated
        );

        return response()->json($availability, 201);
    }

    /**
     * Remove a specific availability slot
     */
    public function destroy(Mentor $mentor, MentorAvailability $availability)
    {
        // Safety check to ensure the availability belongs to the mentor provided in the URL
        if ($availability->mentor_id !== $mentor->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $availability->delete();

        return response()->json(null, 204);
    }

    /**
     * Optional: Bulk update (Useful for the React "Apply to Selected Days" feature)
     */
    public function bulkStore(Request $request, Mentor $mentor)
    {
        $validated = $request->validate([
            'days'       => 'required|array',
            'days.*'     => 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i|after:start_time',
        ]);

        $results = [];
        foreach ($validated['days'] as $day) {
            $results[] = $mentor->availabilities()->updateOrCreate(
                ['day_of_week' => $day],
                [
                    'start_time' => $validated['start_time'],
                    'end_time'   => $validated['end_time']
                ]
            );
        }

        return response()->json($results, 201);
    }
}
