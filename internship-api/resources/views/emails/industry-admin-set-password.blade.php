@component('mail::message')
# Welcome as Industry Admin!

Hello,

Your account has been created.

**Your one-time verification code:**
**{{ $otp }}**  ← this is what they enter on the page

Click below to set your password:

@component('mail::button', ['url' => $setPasswordUrl])
Set My Password
@endcomponent

Or go to: {{ $setPasswordUrl }}

Enter your email: {{ $email }}
Enter the code above
Then create your password.

Thanks,<br>
The Team
@endcomponent
