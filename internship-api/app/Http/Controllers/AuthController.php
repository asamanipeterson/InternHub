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

class AuthController extends Controller
{
    /**
     * Register a new user (student)
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'university'    => ['required', 'string', 'max:255'],
            'course'        => ['required', 'string', 'max:255'],
            'year'          => ['required', 'string', 'max:100'],
            'email'         => ['required', 'email', 'max:255', 'unique:users'],
            'phone'         => ['required', 'string', 'max:20'],
            'nationality'   => ['required', 'string', 'max:100'],
            'password'      => [
                'required',
                'confirmed',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[^A-Za-z0-9]/',
            ],
        ]);

        $user = User::create([
            'name'          => $validated['name'],
            'university'    => $validated['university'],
            'course'        => $validated['course'],
            'year'          => $validated['year'],
            'email'         => $validated['email'],
            'phone'         => $validated['phone'],
            'nationality'   => $validated['nationality'],
            'password'      => Hash::make($validated['password']),
            'user_type'     => 'user', // default to student
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->only([
                'id',
                'name',
                'email',
                'user_type',
                'university',
                'course',
                'year',
                'phone',
                'nationality',
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

        // Generate and store OTP (expires in 60 seconds)
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        OneTimePassCode::updateOrCreate(
            ['user_id' => $user->id],
            [
                'code'       => $code,
                'expires_at' => Carbon::now()->addSeconds(60),
            ]
        );

        // Send email
        Mail::to($user->email)->queue(new OtpMail($code));

        // Store user ID in session for verification step
        session(['otp_user_id' => $user->id]);

        return response()->json([
            'message' => 'A 6-digit verification code has been sent to your email.',
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

        // Success → login the user
        Auth::login($user);

        // Cleanup OTP record and session
        $otpRecord->delete();
        $request->session()->forget('otp_user_id');

        // Create Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Explicitly return user with user_type so frontend can redirect correctly
        return response()->json([
            'user' => $user->only([
                'id',
                'name',
                'email',
                'user_type',               // ← Critical fix: now included
                'university',
                'course',
                'year',
                'phone',
                'nationality',
            ]),
            'token'   => $token,
            'message' => 'Verification successful'
        ]);
    }

    /**
     * Resend OTP
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

        // Generate new OTP
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
     * Get authenticated user (for /api/user endpoint)
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Forgot Password → send OTP
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Security: Don't reveal if email exists
            return response()->json(['message' => 'If this email is registered, a code has been sent.']);
        }

        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        OneTimePassCode::updateOrCreate(
            ['user_id' => $user->id],
            [
                'code'       => $code,
                'expires_at' => Carbon::now()->addMinutes(10),
            ]
        );

        Mail::to($user->email)->queue(new OtpMail($code));

        return response()->json(['message' => 'Verification code sent.']);
    }

    /**
     * Reset Password using OTP
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'otp'      => 'required|string|size:6',
            'password' => 'required|confirmed|min:8',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid request.'], 404);
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

        return response()->json(['message' => 'Password has been updated.']);
    }
}
