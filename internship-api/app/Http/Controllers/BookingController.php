<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Company;
use App\Mail\PaymentLinkMail;
use App\Mail\ApplicationRejectedMail;
use App\Jobs\ExpireBookingJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * Store a new internship application (student submission)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'company_id'     => 'required|exists:companies,id',
            'student_name'   => 'required|string|max:255',
            'student_email'  => 'required|email|max:255',
            'student_phone'  => 'required|string|max:20',
            'student_id'     => 'required|string|max:50',
            'university'     => 'required|string|max:255',
            'cv'             => 'required|mimes:pdf|max:10000', // 10MB max
        ]);

        $company = Company::findOrFail($data['company_id']);

        // NEW: Block if applications are closed for this company
        if (!$company->applications_open) {
            return response()->json([
                'message' => 'Applications are currently closed for this company.'
            ], 403);
        }

        if ($company->available_slots <= 0) {
            return response()->json([
                'message' => 'No available slots for this company.'
            ], 400);
        }

        // Store CV in storage/app/public/cvs
        $cvPath = $request->file('cv')->store('cvs', 'public');

        $booking = Booking::create([
            'company_id'      => $data['company_id'],
            'student_name'    => $data['student_name'],
            'student_email'   => $data['student_email'],
            'student_phone'   => $data['student_phone'],
            'student_id'      => $data['student_id'],
            'university'      => $data['university'],
            'cv_path'         => $cvPath,
            'status'          => 'pending',
        ]);

        return response()->json([
            'message' => 'Application submitted successfully. It is now pending admin review.',
            'booking' => $booking->load('company')
        ], 201);
    }

    /**
     * Get all bookings grouped by industry (for admin dashboard)
     */
    public function index(Request $request)
    {
        $query = Booking::with('company')->latest();

        $bookings = $query->get();

        $grouped = $bookings->groupBy(function ($booking) {
            return $booking->company->industry ?? 'Uncategorized';
        })->map(function ($group, $industry) {
            return [
                'industry' => $industry,
                'count'    => $group->count(),
                'pending'  => $group->where('status', 'pending')->count(),
                'bookings' => $group->map(function ($booking) {
                    return [
                        'id'            => $booking->id,
                        'company'       => [
                            'id'   => $booking->company->id,
                            'name' => $booking->company->name,
                        ],
                        'student_name'  => $booking->student_name,
                        'student_email' => $booking->student_email,
                        'student_phone' => $booking->student_phone,
                        'university'    => $booking->university,
                        'cv_path'       => $booking->cv_path,
                        'status'        => $booking->status,
                        'created_at'    => $booking->created_at,
                        'expires_at'    => $booking->expires_at,
                    ];
                })->values(),
            ];
        })->values();

        return response()->json($grouped);
    }

    /**
     * Approve a pending application → Initialize Paystack + Send email
     */
    public function approve($id, Request $request)
    {
        $amountInPesewas = 200;

        $booking = Booking::with('company')->findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending applications can be approved.'
            ], 400);
        }

        if ($booking->company->available_slots <= 0) {
            return response()->json([
                'message' => 'No available slots remaining for this company.'
            ], 400);
        }

        $reference = 'intern_' . Str::random(10) . '_' . $booking->id;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.paystack.secret_key'),
            'Content-Type'  => 'application/json',
        ])->post('https://api.paystack.co/transaction/initialize', [
            'reference'     => $reference,
            'amount'        => $amountInPesewas,
            'currency'      => 'GHS',
            'email'         => $booking->student_email,
            'callback_url'  => route('payment.callback'),
            'channels'      => ['card', 'mobile_money'],
            'metadata'      => [
                'booking_id'   => $booking->id,
                'company_name' => $booking->company->name,
            ],
        ]);

        if (!$response->successful() || !$response->json('status')) {
            return response()->json([
                'message' => 'Failed to initialize payment with Paystack.',
                'error'   => $response->json()
            ], 500);
        }

        $data = $response->json('data');

        $booking->update([
            'status'            => 'approved',
            'payment_reference' => $reference,
            'amount'            => $amountInPesewas,
            'currency'          => 'GHS',
            'expires_at'        => now()->addHours(24),
        ]);

        Mail::to($booking->student_email)->send(new PaymentLinkMail($booking, $data['authorization_url']));

        ExpireBookingJob::dispatch($booking->id)->delay(now()->addHours(24));

        return response()->json([
            'message'     => 'Application approved. Payment link for GHS 2.00 sent to student.',
            'payment_url' => $data['authorization_url']
        ]);
    }

    /**
     * Reject a pending application with reason
     */
    public function reject($id, Request $request)
    {
        $request->validate([
            'reason' => 'required|string|min:10|max:1000',
        ]);

        $booking = Booking::findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Cannot reject a non-pending application.'
            ], 400);
        }

        $booking->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->reason,
            'expires_at'       => null,
        ]);

        Mail::to($booking->student_email)->send(new ApplicationRejectedMail($booking));

        return response()->json([
            'message' => 'Application rejected and notification sent.'
        ]);
    }

    public function forallbookings()
    {
        $bookings = Booking::with('company')->latest()->get();

        return response()->json($bookings);
    }
    public function industryAdminBookings(Request $request)
    {
        $user = $request->user();

        // Security: only industry admins can access this
        if (!$user->isIndustryAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $industries = $user->getManagedIndustries();

        if (empty($industries)) {
            return response()->json([
                'bookings' => [],
                'stats' => ['total' => 0, 'pending' => 0, 'approved' => 0]
            ]);
        }

        $bookings = Booking::whereHas('company', function ($query) use ($industries) {
            $query->whereIn('industry', $industries);
        })
            ->with(['company' => function ($q) {
                $q->select('id', 'name'); // minimal fields needed
            }])
            ->latest()
            ->get();

        $stats = [
            'total'   => $bookings->count(),
            'pending' => $bookings->where('status', 'pending')->count(),
            'approved' => $bookings->whereIn('status', ['approved', 'paid'])->count(),
        ];

        // Format response to match frontend expectations
        $formattedBookings = $bookings->map(function ($booking) {
            return [
                'id'            => $booking->id,
                'company'       => [
                    'name' => $booking->company->name ?? 'N/A',
                ],
                'student_name'  => $booking->student_name,
                'university'    => $booking->university,
                'status'        => $booking->status,
                'created_at'    => $booking->created_at->toDateString(),
                'cv_path'       => $booking->cv_path,
            ];
        });

        return response()->json([
            'bookings' => $formattedBookings,
            'stats'    => $stats,
        ]);
    }
}
