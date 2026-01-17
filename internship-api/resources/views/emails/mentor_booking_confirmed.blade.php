<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden; }
        .header { background-color: #004a99; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .details { background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 10px;
        }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #777; }
        .meet-icon { vertical-align: middle; margin-right: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Session Confirmed!</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{{ $booking->student_name }}</strong>,</p>
            <p>Your mentorship session has been successfully booked and paid for. Your mentor is looking forward to meeting you!</p>

            <div class="details">
                <p><strong>Mentor:</strong> {{ $booking->mentor->name }}</p>
                <p><strong>Date & Time:</strong> {{ \Carbon\Carbon::parse($booking->scheduled_at)->format('F j, Y \a\t g:i A') }}</p>
                <p><strong>Duration:</strong> 45 Minutes</p>
            </div>

            <h3>Join the Meeting</h3>
            <p>At the scheduled time, please click the button below to join your Google Meet session:</p>

            @if($booking->google_meet_link)
                <a href="{{ $booking->google_meet_link }}" class="button">
                    Join Google Meet
                </a>
                <p style="font-size: 13px; color: #666; margin-top: 10px;">
                    Link: <a href="{{ $booking->google_meet_link }}">{{ $booking->google_meet_link }}</a>
                </p>
            @else
                <p style="color: #d9534f;"><em>The meeting link is being generated. You will receive a calendar invitation shortly.</em></p>
            @endif

            <p><strong>Note:</strong> A calendar invitation has also been sent to your email ({{ $booking->student_email }}).</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
            <p><a href="{{ config('app.frontend_url') }}">Visit our platform</a></p>
        </div>
    </div>
</body>
</html>
