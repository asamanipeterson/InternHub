<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 12px; overflow: hidden; }
        .header { background-color: #004a99; color: white; padding: 25px; text-align: center; }
        .content { padding: 30px; }

        /* Mentor Detail Card */
        .mentor-profile {
            display: table; /* Best for email compatibility instead of flex */
            width: 100%;
            background-color: #f0f7ff;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border: 1px solid #d0e3ff;
        }
        .mentor-image-cell { display: table-cell; width: 80px; vertical-align: middle; }
        .mentor-details-cell { display: table-cell; padding-left: 20px; vertical-align: middle; }

        .profile-img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #fff; }
        .mentor-name { font-size: 18px; font-weight: bold; color: #004a99; margin: 0; }
        .mentor-subtitle { font-size: 14px; color: #555; margin: 2px 0; font-weight: 600; }
        .mentor-bio { font-size: 13px; color: #666; margin-top: 8px; font-style: italic; line-height: 1.4; }

        .session-box { background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
        .button {
            display: inline-block;
            padding: 14px 30px;
            background-color: #28a745;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin-top: 15px;
        }
        .footer { padding: 20px; text-align: center; font-size: 11px; color: #999; background: #f4f4f4; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0; font-size: 24px;">Session Confirmed!</h1>
        </div>

        <div class="content">
            <p>Hello <strong>{{ $booking->student_name }}</strong>,</p>
            <p>Your payment was successful. You are all set for your mentorship session!</p>

            <div class="mentor-profile">
                <div class="mentor-details-cell">
                    <p class="mentor-name">{{ $booking->mentor->user->name }}</p>
                    <p class="mentor-subtitle">
                        {{ $booking->mentor->title }}
                        @if($booking->mentor->specialization) • {{ $booking->mentor->specialization }} @endif
                    </p>
                    @if($booking->mentor->bio)
                        <p class="mentor-bio">"{{ Str::limit($booking->mentor->bio, 100) }}"</p>
                    @endif
                </div>
            </div>

            <div class="session-box">
                <p style="margin-top:0;"><strong>Scheduled For:</strong> {{ \Carbon\Carbon::parse($booking->scheduled_at)->format('l, F j, Y') }}</p>
                <p><strong>Time:</strong> {{ \Carbon\Carbon::parse($booking->scheduled_at)->format('g:i A') }} (60 Minutes)</p>
                <p style="margin-bottom:0;"><strong>Price Paid:</strong> ${{ number_format($booking->mentor->session_price, 2) }}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p>To join the video call, use the link below at the scheduled time:</p>
                @if($booking->google_meet_link)
                    <a href="{{ $booking->google_meet_link }}" class="button">Join Google Meet</a>
                    <p style="font-size: 12px; color: #888; margin-top: 10px;">{{ $booking->google_meet_link }}</p>
                @else
                    <div style="padding: 12px; background: #fff3cd; color: #856404; border-radius: 6px; font-size: 13px;">
                        The meeting link is being generated and will be sent to your email shortly.
                    </div>
                @endif
            </div>

            <p style="font-size: 13px; color: #666;">
                A calendar invitation has been sent to <strong>{{ $booking->student_email }}</strong>. Please ensure you have Google Meet installed if you are joining via mobile.
            </p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
            <p>You received this email because you booked a session on our platform.</p>
        </div>
    </div>
</body>
</html>
