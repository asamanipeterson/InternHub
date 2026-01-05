<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    public function index()
    {
        return response()->json(Company::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'industry' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'total_slots' => 'required|integer|min:0',
            'available_slots' => 'required|integer|min:0',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('companies', 'public');
            $validated['logo'] = 'storage/' . $path;
        }

        $company = Company::create($validated);

        return response()->json($company, 201);
    }

    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'industry' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'total_slots' => 'required|integer|min:0',
            'available_slots' => 'required|integer|min:0',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($company->logo && Storage::disk('public')->exists(str_replace('storage/', '', $company->logo))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $company->logo));
            }

            $path = $request->file('logo')->store('companies', 'public');
            $validated['logo'] = 'storage/' . $path;
        }

        $company->update($validated);

        return response()->json($company);
    }

    public function destroy(Company $company)
    {
        // Delete logo file if exists
        if ($company->logo && Storage::disk('public')->exists(str_replace('storage/', '', $company->logo))) {
            Storage::disk('public')->delete(str_replace('storage/', '', $company->logo));
        }

        $company->delete();

        return response()->json(null, 204);
    }
}
