<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    /**
     * Display a listing of companies.
     */
    public function index()
    {
        return response()->json(Company::latest()->get());
    }

    /**
     * Store a newly created company.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'logo'            => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'industry'        => 'required|string|max:255',
            'description'     => 'nullable|string',
            'location'        => 'nullable|string|max:255',
            'total_slots'     => 'required|integer|min:0',
            'available_slots' => 'required|integer|min:0',
            'is_paid'         => 'required|boolean',
            'requirements'    => 'nullable|string|max:5000',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('companies', 'public');
            $validated['logo'] = 'storage/' . $path;
        }

        $company = Company::create($validated);

        return response()->json($company, 201);
    }

    /**
     * Update the specified company.
     */
    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'logo'            => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'industry'        => 'required|string|max:255',
            'description'     => 'nullable|string',
            'location'        => 'nullable|string|max:255',
            'total_slots'     => 'required|integer|min:0',
            'available_slots' => 'required|integer|min:0',
            'is_paid'         => 'required|boolean',
            'requirements'    => 'nullable|string|max:5000',
        ]);

        if ($request->hasFile('logo')) {
            if ($company->logo) {
                $oldPath = str_replace('storage/', '', $company->logo);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $path = $request->file('logo')->store('companies', 'public');
            $validated['logo'] = 'storage/' . $path;
        }

        $company->update($validated);

        return response()->json($company);
    }

    /**
     * Remove the specified company.
     */
    public function destroy(Company $company)
    {
        if ($company->logo) {
            $path = str_replace('storage/', '', $company->logo);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $company->delete();

        return response()->json(null, 204);
    }

    /**
     * Toggle applications open/closed for the specified company (admin only).
     */
    public function toggleApplications(Request $request, Company $company)
    {
        $validated = $request->validate([
            'open' => 'required|boolean',
        ]);

        $company->update([
            'applications_open' => $validated['open'],
        ]);

        return response()->json([
            'message' => 'Applications ' . ($validated['open'] ? 'opened' : 'closed') . ' for ' . $company->name,
            'open' => $company->applications_open,
        ]);
    }
}
