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


Route::get('/set-password', function () {
    return view('auth.set-password');
})->middleware('signed')->name('set-password');
