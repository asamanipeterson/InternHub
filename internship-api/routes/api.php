<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\MentorController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MentorBookingController;
use App\Http\Controllers\MentorAvailabilityController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/mentors/{uuid}/available-slots', [MentorBookingController::class, 'getAvailableSlots']);
// Public company & mentor listing
Route::apiResource('companies', CompanyController::class);
Route::apiResource('mentors', MentorController::class);

// Protected admin routes
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::apiResource('bookings', BookingController::class)->only(['index']);
    Route::post('bookings/{id}/approve', [BookingController::class, 'approve']);
    Route::post('bookings/{id}/reject', [BookingController::class, 'reject']);
});

Route::post('bookings', [BookingController::class, 'store']);

// Auth protected user route
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn(Request $request) => $request->user());
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Payment routes
Route::post('/payment/webhook', [PaymentController::class, 'handleWebhook']);
Route::get('/payment/success', [PaymentController::class, 'success']);
Route::get('/payment/cancel', [PaymentController::class, 'cancel']);
Route::get('/payment/callback', [PaymentController::class, 'success'])->name('payment.callback');



Route::post('/mentor/book/initiate', [MentorBookingController::class, 'initiatePayment']);




Route::get('mentors/{mentor}/availabilities', [MentorAvailabilityController::class, 'index']);
Route::post('mentors/{mentor}/availabilities', [MentorAvailabilityController::class, 'store']);
Route::delete('mentors/{mentor}/availabilities/{availability}', [MentorAvailabilityController::class, 'destroy']);

// Get available time slots for a specific date
Route::get('/mentors/{uuid}/available-slots', [MentorBookingController::class, 'getAvailableSlots']);

// Get available time slots for a specific date
// Route::get('/mentors/{uuid}/available-slots', [MentorBookingController::class, 'getAvailableSlots']);
