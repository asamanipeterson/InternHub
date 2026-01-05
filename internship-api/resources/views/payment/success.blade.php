<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Successful</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        h1 {
            color: #1a73e8;
        }
        .button {
            display: inline-block;
            background: #1a73e8;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h1>Payment Successful!</h1>
    <p>Thank you, {{ $booking->student_name }}! Your internship slot at <strong>{{ $booking->company->name }}</strong> is being processed.</p>
    <p>You'll receive a confirmation email shortly.</p>
    <a href="/internships" className="button">Back to Internships</a>
</body>
</html>
