<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Mentorship Booking</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; margin: 0; padding: 20px; }
        .container { max-width: 620px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 8px 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 32px 30px; }
        h2 { color: #1f2937; font-size: 18px; margin: 28px 0 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }

        .info-grid { display: table; width: 100%; margin-bottom: 16px; border-spacing: 0 8px; }
        .info-row { display: table-row; }
        .info-label { display: table-cell; width: 140px; font-weight: bold; color: #6b7280; font-size: 14px; }
        .info-value { display: table-cell; color: #111827; font-size: 14px; }

        .topic-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-top: 20px; }
        .topic-label { color: #4f46e5; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; display: block; }
        .topic-text { font-style: italic; color: #475569; font-size: 14px; line-height: 1.5; }

        .btn { display: inline-block; background: #6366f1; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; }
        .footer { background: #f3f4f6; padding: 24px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .highlight { color: #6366f1; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Mentorship Booking!</h1>
            <p>A student has booked and paid for a session with you</p>
        </div>

        <div class="content">
            <h2>Student Information</h2>
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Name:</div>
                    <div class="info-value">{{ $booking->student_name }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Email:</div>
                    <div class="info-value">{{ $booking->student_email }}</div>
                </div>

                @if($booking->student_phone)
                <div class="info-row">
                    <div class="info-label">Phone:</div>
                    <div class="info-value">{{ $booking->student_phone }}</div>
                </div>
                @endif

                <div class="info-row">
                    <div class="info-label">University:</div>
                    <div class="info-value highlight">
                        {{ $booking->student_university ?? $booking->student_institution ?? $booking->university ?? 'N/A' }}
                    </div>
                </div>

                <div class="info-row">
                    <div class="info-label">Programme:</div>
                    <div class="info-value highlight">
                        {{ $booking->student_course ?? $booking->course ?? 'N/A' }}
                    </div>
                </div>

                <div class="info-row">
                    <div class="info-label">Level:</div>
                    <div class="info-value">
                        Year/Level {{ $booking->student_level ?? $booking->level ?? 'N/A' }}
                    </div>
                </div>

                <div class="info-row">
                    <div class="info-label">DOB:</div>
                    <div class="info-value">
                        @php
                            $dob = $booking->date_of_birth ?? $booking->student_dob ?? $booking->dob;
                        @endphp
                        {{ $dob ? \Carbon\Carbon::parse($dob)->format('d M Y') : 'N/A' }}
                    </div>
                </div>
            </div>

            <div class="topic-box">
                <span class="topic-label">Student's Mentorship Topic</span>
                <p class="topic-text">
                    "{{ $booking->topic_description ?? $booking->student_topic ?? $booking->topic ?? 'No specific topic provided.' }}"
                </p>
            </div>

            <h2>Session Details</h2>
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Date & Time:</div>
                    <div class="info-value highlight">
                        {{ \Carbon\Carbon::parse($booking->scheduled_at)->format('l, F j, Y \a\t g:i A') }}
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">Amount Paid:</div>
                    <div class="info-value">GHS {{ number_format($booking->amount, 2) }}</div>
                </div>
            </div>

            @if($booking->google_meet_link)
                <div style="text-align: center; margin: 32px 0;">
                    <a href="{{ $booking->google_meet_link }}" class="btn">
                        Join Google Meet Session
                    </a>
                </div>
            @endif
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
