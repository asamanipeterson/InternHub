<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\OneTimePassCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Mail\WelcomeEmail;
use Illuminate\Support\Facades\Cache;

class AuthController extends Controller
{
    /**
     * Register a new user (student)
     */
    /**
     * Register a new user (student)
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name'         => ['required', 'string', 'max:100'],
            'middle_name'        => ['nullable', 'string', 'max:100'],
            'last_name'          => ['required', 'string', 'max:100'],
            'university'         => ['required', 'string', 'max:255'],
            'course'             => ['required', 'string', 'max:255'],
            'year'               => ['required', 'string', 'max:100'],
            'phone'              => ['required', 'string', 'max:20'],
            'nationality'        => ['required', 'string', 'max:100'],
            'gender'             => ['required', 'in:Male,Female,Non-binary,Other,Prefer not to say'],
            'date_of_birth'      => ['required', 'date', 'before:-15 years'],
            'email'              => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'           => [
                'required',
                'confirmed',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[^A-Za-z0-9]/',
            ],
        ]);

        // Logic to combine name
        $fullName = trim($validated['first_name'] . ' ' . ($validated['middle_name'] ?? '') . ' ' . $validated['last_name']);
        $fullName = str_replace('  ', ' ', $fullName);

        $user = User::create([
            'name'               => $fullName, // Combined Name
            'first_name'         => $validated['first_name'],
            'middle_name'        => $validated['middle_name'] ?? null,
            'last_name'          => $validated['last_name'],
            'university'         => $validated['university'],
            'course'             => $validated['course'],
            'year'               => $validated['year'],
            'phone'              => $validated['phone'],
            'nationality'        => $validated['nationality'],
            'gender'             => $validated['gender'],
            'date_of_birth'      => $validated['date_of_birth'],
            'email'              => $validated['email'],
            'password'           => Hash::make($validated['password']),
            'user_type'          => 'user',
        ]);

        Mail::to($user->email)->queue(new WelcomeEmail($user));

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->only([
                'id',
                'name',
                'first_name',
                'middle_name',
                'last_name',
                'email',
                'user_type',
                'university',
                'course',
                'year',
                'phone',
                'nationality',
                'gender',
                'date_of_birth'
            ]),
            'token' => $token,
        ], 201);
    }

    /**
     * Login → send OTP instead of direct login
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = $request->user();

        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        OneTimePassCode::updateOrCreate(
            ['user_id' => $user->id],
            [
                'code'       => $code,
                'expires_at' => Carbon::now()->addSeconds(60),
            ]
        );

        Mail::to($user->email)->queue(new OtpMail($code));

        session(['otp_user_id' => $user->id]);

        return response()->json([
            'message'  => 'A 6-digit verification code has been sent to your email.',
            'redirect' => '/verify-otp'
        ]);
    }

    /**
     * Verify OTP → complete login
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $userId = session('otp_user_id');

        if (!$userId) {
            return response()->json(['message' => 'Session expired. Please login again.'], 401);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $otpRecord = OneTimePassCode::where('user_id', $user->id)
            ->where('code', $request->otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otpRecord) {
            return response()->json(['message' => 'Invalid or expired code'], 422);
        }

        Auth::login($user);

        $otpRecord->delete();
        $request->session()->forget('otp_user_id');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->only([
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'email',
                'user_type',
                'university',
                'course',
                'year',
                'phone',
                'nationality',
                'gender',
                'date_of_birth'
            ]),
            'token'   => $token,
            'message' => 'Verification successful'
        ]);
    }

    /**
     * Resend OTP (for login flow)
     */
    public function resendOtp(Request $request)
    {
        $userId = session('otp_user_id');

        if (!$userId) {
            return response()->json(['message' => 'Session expired'], 401);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        OneTimePassCode::updateOrCreate(
            ['user_id' => $user->id],
            [
                'code'       => $code,
                'expires_at' => Carbon::now()->addSeconds(60),
            ]
        );

        Mail::to($user->email)->queue(new OtpMail($code));

        return response()->json(['message' => 'New verification code sent']);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Forgot Password → send OTP (secure – same message always)
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Direct message you want
            return response()->json([
                'message' => 'This email is not registered in our system. Please sign up first before you can reset your password.'
            ], 404);  // or 422 – using error status helps frontend distinguish
        }

        // ── Exists ── proceed normally
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        OneTimePassCode::updateOrCreate(
            ['user_id' => $user->id],
            [
                'code'       => $code,
                'expires_at' => Carbon::now()->addMinutes(10),
            ]
        );

        Mail::to($user->email)->queue(new OtpMail($code));

        return response()->json([
            'message' => 'A 6-digit reset code has been sent to your email.'
        ]);
    }
    /**
     * Reset Password using OTP
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'               => 'required|email',
            'otp'                 => 'required|string|size:6',
            'password'            => 'required|confirmed|min:8',
            'password_confirmation' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid request.'], 422);
        }

        $otpRecord = OneTimePassCode::where('user_id', $user->id)
            ->where('code', $request->otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otpRecord) {
            return response()->json(['message' => 'Invalid or expired code.'], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        $otpRecord->delete();

        return response()->json(['message' => 'Password has been updated successfully.']);
    }

    // ───────────────────────────────────────────────
    // Optional / legacy methods (you can keep or remove)
    // ───────────────────────────────────────────────

    public function verifySetPasswordOtp(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'otp'     => 'required|digits:6',
        ]);

        $otpRecord = OneTimePassCode::where('user_id', $request->user_id)
            ->where('code', $request->otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otpRecord) {
            return response()->json(['message' => 'Invalid or expired code'], 422);
        }

        return response()->json(['valid' => true]);
    }

    public function setPasswordAndLogin(Request $request)
    {
        $request->validate([
            'user_id'              => 'required|exists:users,id',
            'password'             => 'required|min:8|confirmed',
            'password_confirmation' => 'required',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->password) {
            return response()->json(['message' => 'Password already set'], 403);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Password set successfully',
            'user'    => $user,
            'token'   => $token,
        ]);
    }
}
