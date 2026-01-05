<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Application Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">

    <h2>Hello {{ $booking->student_name }},</h2>

    <p>We regret to inform you that your application for the internship at <strong>{{ $booking->company->name }}</strong> was not successful.</p>

    <p><strong>Reason:</strong><br>
        {{ $booking->rejection_reason ?? 'No specific reason provided.' }}
    </p>

    <p>We encourage you to apply again in the future and wish you the best in your career journey.</p>

    <p>Best regards,<br>The Internship Team</p>

</body>
</html>
