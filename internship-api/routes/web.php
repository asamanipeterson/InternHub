<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MentorBookingController;

// Route::get('/', function () {
//     return view('welcome');
// });
// Route::get('/', function () {
//     return response()->json(['message' => 'Welcome to the Sanctuary API']);
// });

Route::get('/mentor/booking/callback', [MentorBookingController::class, 'handleCallback'])
    ->name('mentor.booking.callback');
