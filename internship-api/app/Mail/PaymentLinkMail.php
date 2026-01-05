<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentLinkMail extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $paymentUrl;

    public function __construct(Booking $booking, string $paymentUrl)
    {
        $this->booking = $booking;
        $this->paymentUrl = $paymentUrl;
    }

    public function build()
    {
        return $this
            ->subject('Complete Your Internship Payment')
            ->view('emails.payment_link')
            ->with([
                'booking' => $this->booking,
                'paymentUrl' => $this->paymentUrl,
            ]);
    }
}
