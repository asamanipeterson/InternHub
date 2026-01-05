<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Complete Your Payment</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">

    <h2>Congratulations, {{ $booking->student_name }}!</h2>

    <p>Your internship application at <strong>{{ $booking->company->name }}</strong> has been <strong>approved</strong>!</p>

    <p>To secure your slot, please complete payment of <strong>{{ $booking->formatted_amount }}</strong> within the next <strong>24 hours</strong>.</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $paymentUrl }}"
           style="background: #0066CC; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">
            Pay Now with Paystack
        </a>
    </div>

    <p><strong>Important:</strong> This link expires in 24 hours. If payment is not completed, your slot will be released.</p>

    <p>Thank you!<br>The Internship Team</p>

</body>
</html>
