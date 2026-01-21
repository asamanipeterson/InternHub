<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AdminIndustry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use App\Mail\SetIndustryAdminPassword;

class AdminController extends Controller
{
    /**
     * List of valid industries (must match frontend INDUSTRIES array exactly)
     */
    private static array $VALID_INDUSTRIES = [
        "Technology",
        "Finance",
        "Energy",
        "HealthCare",
        "Arts & Design",
        "Education",
        "Manufacturing",
        "Telecommunications",
        "Real Estate",
        "Agriculture",
        "Retail & E-commerce",
        "Transportation",
        "Legal Services",
        "Marketing & Media",
        "Hospitality & Tourism",
        "Construction",
        "Media & Entertainment",
        "Insurance",
        "Pharmaceuticals",
        "Automotive",
        "Aerospace",
        "Defense",
        "Environmental Services",
        "Non-Profit & NGO",
        "Government & Public Sector",
        "Consulting",
        "Human Resources",
        "Logistics & Supply Chain",
        "Fashion & Apparel",
        "Food & Beverage",
        "Sports & Fitness",
        "Gaming",
        "Biotechnology",
        "Renewable Energy",
        "Cybersecurity",
        "Artificial Intelligence",
        "Data Science & Analytics",
        "Cloud Computing",
        "Blockchain & Crypto"
    ];

    /**
     * Create a new industry admin (called from super admin dashboard)
     */
    public function createIndustryAdmin(Request $request)
    {
        if (!auth()->user()?->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'industries' => 'required|array|min:1',
            'industries.*' => 'string|distinct|in:' . implode(',', self::$VALID_INDUSTRIES),
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $industries = $request->industries;

        // Prevent assigning industries that are already taken
        $taken = AdminIndustry::whereIn('industry', $industries)
            ->pluck('industry')
            ->toArray();

        if (!empty($taken)) {
            return response()->json([
                'message' => 'The following industries are already assigned: ' . implode(', ', $taken)
            ], 422);
        }

        // Create user without password
        $user = User::create([
            'name' => explode('@', $request->email)[0],
            'email' => $request->email,
            'password' => null,
            'user_type' => 'industry_admin',
            'email_verified_at' => now(),
        ]);

        // Assign industries
        foreach ($industries as $industry) {
            AdminIndustry::create([
                'user_id' => $user->id,
                'industry' => $industry,
            ]);
        }

        // Send set-password email
        Mail::to($user->email)->queue(new SetIndustryAdminPassword($user));

        return response()->json([
            'message' => 'Industry admin created successfully. Set-password email has been sent.',
            'email' => $user->email,
        ], 201);
    }

    /**
     * Get all industry admins and their assigned industries
     * Used in super admin Dashboard → Admins tab
     */
    public function getIndustryAdmins(Request $request)
    {
        if (!auth()->user()?->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $admins = User::where('user_type', 'industry_admin')
            ->with('adminIndustries')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'industries' => $user->adminIndustries->pluck('industry')->toArray(),
                ];
            });

        return response()->json($admins);
    }
}
