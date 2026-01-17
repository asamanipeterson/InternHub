<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\MentorController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\MentorBookingController;
use App\Http\Controllers\MentorAvailabilityController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ────────────────────────────────────────────────
// Public routes (no auth required)
// ────────────────────────────────────────────────
Route::middleware('web')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

// ────────────────────────────────────────────────
// IMPORTANT: Google callback MUST be public
// This is the URL Google hits after mentor authorizes
// ────────────────────────────────────────────────
Route::get('/google/callback', [MentorController::class, 'handleGoogleCallback'])
    ->name('google.callback');

// ────────────────────────────────────────────────
// Protected routes (require Sanctum authentication)
// ────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn(Request $request) => $request->user());
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('companies', CompanyController::class);

    // Mentor-related protected routes
    Route::group([], function () {
        Route::apiResource('mentors', MentorController::class);

        Route::get('mentor/profile', [MentorController::class, 'profile']);

        // Google Connect: Only logged-in mentor can trigger the redirect URL generation
        Route::get('google/connect', [MentorController::class, 'connectGoogle']);

        Route::get('mentor/bookings', [MentorBookingController::class, 'getMentorBookings']);
    });

    // Available slots (needs auth because it's for booking flow)
    Route::get('/mentors/{uuid}/available-slots', [MentorBookingController::class, 'getAvailableSlots']);
    Route::get('/mentors/{uuid}', [MentorController::class, 'show']);
    // Mentor availability management
    Route::prefix('mentors/{mentor}')->controller(MentorAvailabilityController::class)->group(function () {
        Route::get('availabilities',  'index');
        Route::post('availabilities', 'store');
        Route::delete('availabilities/{availability}', 'destroy');
    });
});

// Payment routes
Route::controller(PaymentController::class)->group(function () {
    Route::post('/payment/webhook', 'handleWebhook');     // public
    Route::get('/payment/success', 'success')->name('payment.success');
    Route::get('/payment/cancel', 'cancel')->name('payment.cancel');
    Route::get('/payment/callback', 'success')->name('payment.callback');
});

// Mentorship booking routes (most protected)
Route::controller(MentorBookingController::class)->middleware('auth:sanctum')->group(function () {
    Route::post('/mentor/book/initiate', 'initiatePayment');
    // Route::post('/mentor/payment/webhook', 'handleWebhook');
    Route::prefix('admin')->group(function () {
        Route::get('/mentor-bookings', 'getAdminBookings');
        Route::get('/mentor-bookings/all', 'getAllMentorBookings');
    });
});

// Admin protected
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::apiResource('bookings', BookingController::class)->only(['index']);
    Route::post('bookings/{id}/approve', [BookingController::class, 'approve']);
    Route::post('bookings/{id}/reject', [BookingController::class, 'reject']);
});

Route::post('bookings', [BookingController::class, 'store'])->middleware('auth:sanctum');

// Mentor-specific protected prefix
Route::middleware(['auth:sanctum', 'mentor'])->prefix('mentor')->group(function () {
    Route::get('/bookings', [MentorBookingController::class, 'getMentorBookings']);
});

// Signed route for password set
Route::get('/mentor/set-password/{token}', function (string $token) {
    return view('auth.set-password', ['token' => $token]);
})->middleware('signed')->name('mentor.set-password');
