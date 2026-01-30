<div style="text-align: center; margin-bottom: 1.5rem;">
    <img src="{{ asset('logo.png') }}"
         alt="{{ config('app.name') }}"
         style="max-height: 70px;" />
</div>

@component('mail::message')

# Welcome to {{ $appName }}, {{ $user->first_name }}! 🎉

We're **truly excited** to have you join our community!

You've just taken an important step toward building your future — you're now part of a growing network of ambitious students and young professionals from universities across the globe.

### Ready to Shape Your Future?
Here are the most important things you can do right now:

- **Log in** to browse hundreds of exciting internships and opportunities
- Get matched with **qualified mentors** who will guide you, share industry insights, and help shape your career dreams
- Complete your profile so we can recommend the best internships and mentors for you

@component('mail::button', ['url' => $loginUrl, 'color' => 'primary'])
Login to Browse Internships & Find Mentors
@endcomponent

<p style="margin: 1.5rem 0; font-size: 1rem; color: #374151;">
    <strong>Pro tip:</strong> The sooner you complete your profile and start exploring, the faster you'll get personalized mentor matches and internship recommendations.
</p>

If the button above doesn't work, copy and paste this link:
{{ $loginUrl }}

We're here to support you every step of the way — just reply to this email if you have any questions.

Here's to turning your dreams into reality! 🚀
The {{ $appName }} Team

<small style="color: #6b7280; margin-top: 2.5rem; display: block; font-size: 0.875rem;">
  © {{ date('Y') }} {{ $appName }} • Empowering the next generation of talent
</small>

@endcomponent
