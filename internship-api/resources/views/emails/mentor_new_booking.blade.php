<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Mentorship Booking</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f9fafb;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 620px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .header {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 8px 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 32px 30px;
        }
        h2 {
            color: #1f2937;
            font-size: 20px;
            margin: 28px 0 12px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        li {
            margin-bottom: 12px;
            font-size: 15px;
        }
        strong {
            color: #111827;
            min-width: 140px;
            display: inline-block;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 8px 16px;
            margin-bottom: 16px;
        }
        .btn {
            display: inline-block;
            background: #6366f1;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            transition: background 0.2s;
        }
        .btn:hover {
            background: #4f46e5;
        }
        .footer {
            background: #f3f4f6;
            padding: 24px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .highlight {
            color: #6366f1;
            font-weight: 600;
        }
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
                <strong>Name:</strong>
                <span>{{ $booking->student_name }}</span>

                <strong>Email:</strong>
                <span>{{ $booking->student_email }}</span>

                @if($booking->student_phone)
                    <strong>Phone:</strong>
                    <span>{{ $booking->student_phone }}</span>
                @endif

                @if($booking->age)
                    <strong>Age:</strong>
                    <span>{{ $booking->age }} years</span>
                @endif

                @if($booking->student_university)
                    <strong>University:</strong>
                    <span class="highlight">{{ $booking->student_university }}</span>
                @endif

                @if($booking->student_course)
                    <strong>Programme / Course:</strong>
                    <span class="highlight">{{ $booking->student_course }}</span>
                @endif

                @if($booking->student_level)
                    <strong>Level / Year:</strong>
                    <span class="highlight">{{ $booking->student_level }}</span>
                @endif
            </div>

            <h2>Session Details</h2>
            <div class="info-grid">
                <strong>Date & Time:</strong>
                <span class="highlight">
                    {{ \Carbon\Carbon::parse($booking->scheduled_at)->format('l, F j, Y \a\t g:i A') }} (GMT)
                </span>

                <strong>Amount Paid:</strong>
                <span>GHS {{ number_format($booking->amount, 2) }}</span>

                <strong>Booking ID:</strong>
                <span>#{{ $booking->id }}</span>
            </div>

            @if($booking->zoom_start_url)
                <p style="text-align: center; margin: 32px 0;">
                    <a href="{{ $booking->zoom_start_url }}" class="btn">
                        → Start Zoom Meeting (Host Link)
                    </a>
                </p>
            @endif

            @if($booking->zoom_join_url)
                <p style="margin-top: 24px;">
                    <strong>Participant Join Link (for backup/reference):</strong><br>
                    <a href="{{ $booking->zoom_join_url }}" style="color: #6366f1; word-break: break-all;">
                        {{ $booking->zoom_join_url }}
                    </a>
                </p>
            @endif

            <p style="margin-top: 32px; font-size: 15px;">
                Please join 5–10 minutes early. Review the student's background above to prepare better for the session.
            </p>

            <p style="margin-top: 20px; color: #4b5563; font-size: 14px;">
                If you have any questions or need support, reply directly to this email.
            </p>
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} Your Platform Name. All rights reserved.</p>
            <p style="margin-top: 8px;">
                This is an automated notification. Do not reply unless necessary.
            </p>
        </div>
    </div>
</body>
</html>
