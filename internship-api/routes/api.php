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

// Public routes (no auth required)
Route::middleware('web')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Public listing (you can decide if these should be public or protected)
Route::get('companies', [CompanyController::class, 'index'])->middleware('auth:sanctum');
Route::get('mentors', [MentorController::class, 'index'])->middleware('auth:sanctum');

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // User info & logout
    Route::get('/user', fn(Request $request) => $request->user());
    Route::post('/logout', [AuthController::class, 'logout']);

    // Companies & Mentors (CRUD - admin or owner only, add policy if needed)
    Route::apiResource('companies', CompanyController::class)->except(['index']);
    Route::apiResource('mentors', MentorController::class)->except(['index']);

    // Get available time slots for a mentor on a specific date
    Route::get('/mentors/{uuid}/available-slots', [MentorBookingController::class, 'getAvailableSlots']);

    // Mentor availability management
    Route::prefix('mentors/{mentor}')->controller(MentorAvailabilityController::class,)->group(function () {
        Route::get('availabilities',  'index');
        Route::post('availabilities',  'store');
        Route::delete('availabilities/{availability}',  'destroy');
    });
});

// Payment routes (webhook should be public, others protected if needed)
Route::controller(PaymentController::class)->group(function () {
    Route::post('/payment/webhook', 'handleWebhook');     // Public - Paystack calls this
    Route::get('/payment/success', 'success')->name('payment.success');
    Route::get('/payment/cancel', 'cancel')->name('payment.cancel');
    Route::get('/payment/callback', 'success')->name('payment.callback');
});

// Mentorship booking routes
Route::controller(MentorBookingController::class)->middleware('auth:sanctum')->group(function () {

    Route::post('/mentor/book/initiate', 'initiatePayment');


    Route::post('/mentor/payment/webhook', 'handleWebhook');
    Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
        Route::get('/mentor-bookings', 'getAdminBookings');

        // Optional: list ALL mentorship bookings (pending, paid, expired, etc.)
        Route::get('/mentor-bookings/all', 'getAllMentorBookings');
    });
});

// Internship/Company bookings (admin protected)
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::apiResource('bookings', BookingController::class)->only(['index']);
    Route::post('bookings/{id}/approve', [BookingController::class, 'approve']);
    Route::post('bookings/{id}/reject', [BookingController::class, 'reject']);
});

Route::post('bookings', [BookingController::class, 'store'])->middleware('auth:sanctum');
