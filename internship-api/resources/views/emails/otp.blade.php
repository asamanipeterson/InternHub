<!DOCTYPE html>
<html>
<head>
    <title>Verification Code</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
    <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
        <h2 style="color: #333;">Your Verification Code</h2>
        <p>Use this code to complete your login:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; color: #6a11cb; text-align: center;">
            {{ $code }}
        </div>
        <p>This code expires in <strong>5 minutes</strong>.</p>
        <p style="color: #777; font-size: 14px;">If you didn't request this, ignore this email.</p>
    </div>
</body>
</html>
