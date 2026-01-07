<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Booking</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; padding: 20px; }
        .container { max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: #6366f1; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .btn { display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Booking Alert!</h1>
            <p>You have a new paid mentorship session</p>
        </div>

        <div class="content">
            <h2>Student Details</h2>
            <ul>
                <li><strong>Name:</strong> {{ $booking->student_name }}</li>
                <li><strong>Email:</strong> {{ $booking->student_email }}</li>
                <li><strong>Phone:</strong> {{ $booking->student_phone ?? 'Not provided' }}</li>
            </ul>

            <h2>Session Details</h2>
            <ul>
                <li><strong>Date & Time:</strong> {{ \Carbon\Carbon::parse($booking->scheduled_at)->format('l, F j, Y \a\t g:i A') }} (GMT)</li>
                <li><strong>Amount Received:</strong> GHS {{ number_format($booking->amount, 2) }}</li>
            </ul>

            @if($booking->zoom_start_url)
                <p style="text-align: center;">
                    <a href="{{ $booking->zoom_start_url }}" class="btn">Start Meeting (Host Link)</a>
                </p>
            @endif

            @if($booking->zoom_join_url)
                <p><strong>Participant Link:</strong> {{ $booking->zoom_join_url }}</p>
            @endif

            <p>Please be ready 5 minutes before the session. Good luck!</p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} Your Platform Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
