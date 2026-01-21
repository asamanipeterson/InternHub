<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\MentorController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\MentorBookingController;
use App\Http\Controllers\MentorAvailabilityController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Company;
use App\Http\Controllers\AdminController;

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
Route::post('/verify-set-password-otp', [AuthController::class, 'verifySetPasswordOtp']);
Route::post('/set-password', [AuthController::class, 'setPasswordAndLogin']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

// Google callback MUST be public
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

        Route::get('google/connect', [MentorController::class, 'connectGoogle']);

        Route::get('mentor/bookings', [MentorBookingController::class, 'getMentorBookings']);
    });

    // Available slots
    Route::get('/mentors/{uuid}/available-slots', [MentorBookingController::class, 'getAvailableSlots']);
    Route::get('/mentors/{uuid}', [MentorController::class, 'show']);

    // Mentor availability
    Route::prefix('mentors/{mentor}')->controller(MentorAvailabilityController::class)->group(function () {
        Route::get('availabilities',  'index');
        Route::post('availabilities', 'store');
        Route::delete('availabilities/{availability}', 'destroy');
    });
});

// ────────────────────────────────────────────────
// Toggle applications open/closed (admin only)
// ────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/companies/{company}/toggle-applications', [CompanyController::class, 'toggleApplications']);
});

// Payment routes
Route::controller(PaymentController::class)->group(function () {
    Route::post('/payment/webhook', 'handleWebhook');
    Route::get('/payment/success', 'success')->name('payment.success');
    Route::get('/payment/cancel', 'cancel')->name('payment.cancel');
    Route::get('/payment/callback', 'success')->name('payment.callback');
});

// Mentorship booking routes
Route::controller(MentorBookingController::class)->middleware('auth:sanctum')->group(function () {
    Route::post('/mentor/book/initiate', 'initiatePayment');
    Route::prefix('admin')->group(function () {
        Route::get('/mentor-bookings', 'getAdminBookings');
        Route::get('/mentor-bookings/all', 'getAllMentorBookings');
    });
});

// Admin protected bookings
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::apiResource('bookings', BookingController::class)->only(['index']);
    Route::get('forallbookings', [BookingController::class, 'forallbookings']);
    Route::post('bookings/{id}/approve', [BookingController::class, 'approve']);
    Route::post('bookings/{id}/reject', [BookingController::class, 'reject']);
});

Route::post('bookings', [BookingController::class, 'store'])->middleware('auth:sanctum');
Route::get('/industry-admin/bookings', [BookingController::class, 'industryAdminBookings'])->middleware('auth:sanctum');

// Mentor-specific protected prefix
Route::middleware(['auth:sanctum', 'mentor'])->prefix('mentor')->group(function () {
    Route::get('/bookings', [MentorBookingController::class, 'getMentorBookings']);
});

// Signed route for password set
Route::get('/mentor/set-password/{token}', function (string $token) {
    return view('auth.set-password', ['token' => $token]);
})->middleware('signed')->name('mentor.set-password');


Route::middleware('auth:sanctum')->post('/admin/industry-admins', [AdminController::class, 'createIndustryAdmin'])->middleware('auth:sanctum');


Route::get('/industry-admin/set-password', function () {
    return view('auth.set-industry-password');
})->middleware('signed')->name('industry-admin.set-password');

Route::middleware('auth:sanctum')->get('/admin/industry-admins', [AdminController::class, 'getIndustryAdmins']);


Route::middleware('auth:sanctum')->get('/notifications/count', [NotificationController::class, 'getUnreadCount']);
