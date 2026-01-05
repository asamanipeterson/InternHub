<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\MentorController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Route::post('/bookings', [BookingController::class, 'store']); // Student apply

// Public company & mentor listing
Route::apiResource('companies', CompanyController::class);
Route::apiResource('mentors', MentorController::class)->only(['index', 'show']);

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
