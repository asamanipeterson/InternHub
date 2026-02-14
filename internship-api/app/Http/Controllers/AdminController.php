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
     * Create new industry admin + check for already assigned industries
     */
    /**
     * Create new industry admin + check for already assigned industries
     */
    public function createIndustryAdmin(Request $request)
    {
        if (!auth()->user()?->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'email'      => 'required|email|unique:users,email',
            'industries' => 'required|array|min:1',
            'industries.*' => 'string|distinct|in:' . implode(',', self::$VALID_INDUSTRIES),
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $email = $request->email;
        $industries = $request->industries;

        // Check which industries are already taken
        $taken = AdminIndustry::whereIn('industry', $industries)
            ->pluck('industry')
            ->unique()
            ->values()
            ->toArray();

        if (!empty($taken)) {
            return response()->json([
                'message'          => 'One or more industries are already assigned to another admin',
                'taken_industries' => $taken
            ], 422);
        }

        // Generate name parts
        $emailPrefix = explode('@', $email)[0];
        $firstName = ucfirst(strtolower($emailPrefix));
        $lastName = 'Industry Admin';


        //     ? $industries[0] . ' Admin'

        $user = User::create([
            'first_name'        => $firstName,
            'middle_name'       => null,
            'last_name'         => $lastName,
            'email'             => $email,
            'password'          => null,
            'user_type'         => 'industry_admin',
            'email_verified_at' => now(),
        ]);

        // Assign industries
        foreach ($industries as $industry) {
            AdminIndustry::create([
                'user_id'  => $user->id,
                'industry' => $industry,
            ]);
        }

        // Send password setup email
        Mail::to($user->email)->queue(new SetIndustryAdminPassword($user));

        return response()->json([
            'message' => 'Industry admin created successfully. Set-password email sent.',
            'email'   => $user->email,
            'name'    => $user->full_name,          // uses your accessor
            'industries' => $industries,
        ], 201);
    }

    /**
     * Get all industry admins with their industries
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
                    'id'        => $user->id,
                    'name'      => $user->name,
                    'email'     => $user->email,
                    'industries' => $user->adminIndustries->pluck('industry')->toArray(),
                ];
            });

        return response()->json($admins);
    }

    /**
     * Update industries for an existing industry admin
     * (allows removing and adding — with conflict check)
     */
    public function updateIndustryAdmin(Request $request, $id)
    {
        if (!auth()->user()?->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $admin = User::where('id', $id)
            ->where('user_type', 'industry_admin')
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'industries' => 'required|array',
            'industries.*' => 'string|in:' . implode(',', self::$VALID_INDUSTRIES),
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $newIndustries = $request->industries ?? [];

        // Get currently assigned industries (excluding this admin)
        $takenByOthers = AdminIndustry::where('user_id', '!=', $admin->id)
            ->whereIn('industry', $newIndustries)
            ->pluck('industry')
            ->unique()
            ->toArray();

        if (!empty($takenByOthers)) {
            return response()->json([
                'message' => 'Some industries are already assigned to other admins',
                'taken'   => $takenByOthers
            ], 422);
        }

        // Remove old assignments
        AdminIndustry::where('user_id', $admin->id)->delete();

        // Add new ones
        foreach ($newIndustries as $industry) {
            AdminIndustry::create([
                'user_id'  => $admin->id,
                'industry' => $industry,
            ]);
        }

        return response()->json([
            'message' => 'Industry assignments updated successfully',
            'industries' => $newIndustries
        ]);
    }
}
