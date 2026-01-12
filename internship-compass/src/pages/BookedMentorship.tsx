'use client';

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Video, CheckCircle, Copy, User } from "lucide-react";
import { toast } from "sonner";

interface BookingDetails {
  mentorName: string;
  mentorTitle: string;
  date: string;
  time: string;
  zoomLink: string;
  amount: number;
}

const BookedMentorship = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState<BookingDetails | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('booking');

    if (status === 'success') {
      const bookingData: BookingDetails = {
        mentorName: params.get('mentorName') || 'Mentor',
        mentorTitle: params.get('mentorTitle') || 'Career Guide',
        date: params.get('date') || new Date().toISOString().split('T')[0],
        time: params.get('time') || 'TBD',
        zoomLink: params.get('zoomLink') || 'No Zoom link available',
        amount: parseFloat(params.get('amount') || '0'),
      };

      setBooking(bookingData);
      toast.success("Payment successful! Your session is confirmed.");
    } else if (status === 'failed') {
      toast.error("Payment failed or was cancelled.");
    }

    // Clean URL after reading
    window.history.replaceState({}, '', location.pathname);
  }, [location]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyZoomLink = () => {
    if (booking?.zoomLink && booking.zoomLink !== 'No Zoom link available') {
      navigator.clipboard.writeText(booking.zoomLink);
      toast.success("Zoom link copied to clipboard!");
    } else {
      toast.info("No Zoom link available yet");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 lg:px-8 pt-32">
        <button
          onClick={() => navigate("/mentorship")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Mentors</span>
        </button>
      </div>

      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <CheckCircle className="w-24 h-24 text-accent mx-auto mb-6" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Session Booked Successfully!
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-12">
              You're one step closer to transforming your career.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 -mt-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-3xl shadow-elevated p-8 md:p-12 border border-border">
              {booking ? (
                <>
                  <h2 className="text-3xl font-bold mb-8 text-center">Your Session Details</h2>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mentor</p>
                        <p className="text-xl font-semibold">{booking.mentorName}</p>
                        <p className="text-muted-foreground">{booking.mentorTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Calendar className="w-8 h-8 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="text-xl font-semibold">{formatDate(booking.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Clock className="w-8 h-8 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="text-xl font-semibold">{booking.time} (GMT)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount Paid</p>
                        <p className="text-xl font-semibold text-accent">
                          GHS {booking.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 p-6 bg-secondary/50 rounded-2xl border border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <Video className="w-8 h-8 text-accent" />
                      <h3 className="text-xl font-bold">Zoom Meeting Link</h3>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <a
                        href={booking.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline break-all text-sm"
                      >
                        {booking.zoomLink}
                      </a>

                      <Button
                        variant="accent"
                        size="sm"
                        onClick={copyZoomLink}
                        className="ml-auto"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mt-4">
                      Join 5 minutes early. The meeting will start at your scheduled time.
                    </p>
                  </div>

                  <div className="mt-10 text-center">
                    <p className="text-muted-foreground">
                      A confirmation email has been sent with all details.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-4">Payment Successful!</h2>
                  <p className="text-xl text-muted-foreground">
                    Your mentorship session has been booked.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Check your email for the Zoom meeting link and session details.
                  </p>
                </div>
              )}

              <div className="mt-12 text-center">
                <Button
                  variant="accent"
                  size="lg"
                  onClick={() => navigate("/mentorship")}
                >
                  Browse More Mentors
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BookedMentorship;