<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Session Confirmed</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; padding: 20px; }
        .container { max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: #4f46e5; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .btn { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Congratulations, {{ $booking->student_name }}!</h1>
            <p>Your mentorship session has been successfully booked and paid.</p>
        </div>

        <div class="content">
            <h2>Session Details</h2>
            <ul>
                <li><strong>Mentor:</strong> {{ $booking->mentor->name }} ({{ $booking->mentor->title }})</li>
                <li><strong>Date & Time:</strong> {{ \Carbon\Carbon::parse($booking->scheduled_at)->format('l, F j, Y \a\t g:i A') }} (GMT)</li>
                <li><strong>Amount Paid:</strong> GHS {{ number_format($booking->amount, 2) }}</li>
            </ul>

            @if($booking->zoom_join_url)
                <p style="text-align: center;">
                    <a href="{{ $booking->zoom_join_url }}" class="btn">Join Zoom Meeting</a>
                </p>
                <p style="text-align: center; font-size: 14px; color: #666;">
                    Click the button above 5 minutes before your session starts.
                </p>
            @else
                <p>The mentor will contact you shortly with the meeting link.</p>
            @endif

            <p>We're excited for your growth! If you have any questions, reply to this email.</p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} Your Platform Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
