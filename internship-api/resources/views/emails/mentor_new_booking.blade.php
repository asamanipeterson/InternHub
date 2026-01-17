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
        h2 { color: #1f2937; font-size: 20px; margin: 28px 0 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        .info-grid { display: grid; grid-template-columns: 140px 1fr; gap: 8px 16px; margin-bottom: 16px; }
        strong { color: #111827; min-width: 140px; display: inline-block; }
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
                <strong>Name:</strong> <span>{{ $booking->student_name }}</span>
                <strong>Email:</strong> <span>{{ $booking->student_email }}</span>
                @if($booking->student_phone) <strong>Phone:</strong> <span>{{ $booking->student_phone }}</span> @endif
                @if($booking->age) <strong>Age:</strong> <span>{{ $booking->age }} years</span> @endif
                @if($booking->student_university) <strong>University:</strong> <span class="highlight">{{ $booking->student_university }}</span> @endif
                @if($booking->student_course) <strong>Programme:</strong> <span class="highlight">{{ $booking->student_course }}</span> @endif
            </div>

            <h2>Session Details</h2>
            <div class="info-grid">
                <strong>Date & Time:</strong>
                <span class="highlight">
                    {{ \Carbon\Carbon::parse($booking->scheduled_at)->format('l, F j, Y \a\t g:i A') }} (GMT)
                </span>
                <strong>Amount Paid:</strong> <span>GHS {{ number_format($booking->amount, 2) }}</span>
                <strong>Booking ID:</strong> <span>#{{ $booking->id }}</span>
            </div>

            @if($booking->google_meet_link)
                <p style="text-align: center; margin: 32px 0;">
                    <a href="{{ $booking->google_meet_link }}" class="btn">
                        → Open Google Meet Session
                    </a>
                </p>
                <p style="margin-top: 24px;">
                    <strong>Meeting Link (for reference):</strong><br>
                    <a href="{{ $booking->google_meet_link }}" style="color: #6366f1; word-break: break-all;">
                        {{ $booking->google_meet_link }}
                    </a>
                </p>
            @endif

            <p style="margin-top: 32px; font-size: 15px;">
                The event has been added to your Google Calendar. Please join 5 minutes early.
            </p>
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} Your Platform Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
