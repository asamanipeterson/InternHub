<?php

namespace App\Http\Controllers;

use App\Models\Mentor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MentorController extends Controller
{
    public function index()
    {
        return response()->json(Mentor::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'experience' => 'required|integer|min:0',
            'rating' => 'required|numeric|min:0|max:5',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('mentors', 'public');
            $validated['image'] = 'storage/' . $path;
        }

        $mentor = Mentor::create($validated);

        return response()->json($mentor, 201);
    }

    public function update(Request $request, Mentor $mentor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'experience' => 'required|integer|min:0',
            'rating' => 'required|numeric|min:0|max:5',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($mentor->image && Storage::disk('public')->exists(str_replace('storage/', '', $mentor->image))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $mentor->image));
            }

            $path = $request->file('image')->store('mentors', 'public');
            $validated['image'] = 'storage/' . $path;
        }

        $mentor->update($validated);

        return response()->json($mentor);
    }

    public function destroy(Mentor $mentor)
    {
        if ($mentor->image && Storage::disk('public')->exists(str_replace('storage/', '', $mentor->image))) {
            Storage::disk('public')->delete(str_replace('storage/', '', $mentor->image));
        }

        $mentor->delete();

        return response()->json(null, 204);
    }
}
