<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Confirmed!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">

    <h2>Success! Your Slot is Booked 🎉</h2>

    <p>Dear {{ $booking->student_name }},</p>

    <p>Your payment of <strong>{{ $booking->formatted_amount }}</strong> has been confirmed.</p>

    <p>Congratulations! Your internship slot at <strong>{{ $booking->company->name }}</strong> is now officially secured.</p>

    <p>You will receive further instructions from the company soon.</p>

    <p>Thank you for choosing us!<br>The Internship Team</p>

</body>
</html>
