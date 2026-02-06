'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Calendar, Clock, Video, User, BookOpen, DollarSign, Sparkles } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MentorshipBooking {
  id: string;
  student_name: string;
  student_email: string;
  student_institution: string | null;
  student_course: string | null;
  student_level: string | null;
  scheduled_at: string;
  amount: string | number;
  status: string;
  google_meet_link: string | null;
  created_at: string;
  mentor: {
    name: string | null;
    title: string;
    user?: {
      name: string | null;
      first_name: string;
      last_name: string;
    }
  };
}

const CountUpStat = ({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) => {
  const countValue = useMotionValue(0);
  const rounded = useTransform(countValue, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(countValue, end, {
      duration: 2.5,
      ease: "easeOut",
      delay: 0.5,
    });
    return controls.stop;
  }, [countValue, end]);

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-accent">
        <motion.span>{rounded}</motion.span>{suffix}
      </div>
      <div className="text-sm text-primary-foreground/70 mt-1">{label}</div>
    </div>
  );
};

const AdminMentorshipBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<MentorshipBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [forcedLoading, setForcedLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const minimumDelay = new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const res = await api.get('/api/admin/mentor-bookings');
        await Promise.all([minimumDelay, Promise.resolve()]);
        setBookings(res.data || []);
      } catch (err: any) {
        console.error("Failed to load bookings:", err);
        toast.error("Failed to load mentorship bookings");
        await minimumDelay;
      } finally {
        setLoading(false);
        setForcedLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return { date: 'N/A', time: 'N/A' };
    const dt = new Date(dateTime);
    return {
      date: dt.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
      time: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const totalBookings = bookings.length;
  const upcoming = bookings.filter(b => new Date(b.scheduled_at) > new Date()).length;
  const pendingPayment = bookings.filter(b => b.status?.toLowerCase().includes('pending')).length;

  const totalMoneyPaid = bookings
    .filter(b => b.status?.toLowerCase().includes('paid'))
    .reduce((sum, booking) => sum + Number(booking.amount || 0), 0);

 

  if (loading) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-lg text-primary-foreground/80">Loading available internships...</p>
      </div>
    </div>
  );
}
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 right-[15%] w-96 h-96 rounded-full bg-foreground blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 left-[10%] w-80 h-80 rounded-full bg-foreground blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-24 lg:pt-32 pb-12 gradient-hero">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-5"
              >
                Mentorship{" "}
                <span className="relative inline-block">
                  <span className="text-accent">Administration</span>
                  <motion.span
                    className="absolute -bottom-1 left-0 w-full h-1 bg-accent rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto"
              >
                Manage all mentorship bookings, schedules, payments, and Google Meet sessions in one place.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Quick Stats */}
        <div className="container mx-auto px-4 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-card/80 backdrop-blur-sm border-accent/20 hover:border-accent/40 transition-all">
              <CardContent className="pt-6 text-center">
                <User className="w-10 h-10 mx-auto mb-4 text-accent" />
                <CountUpStat end={totalBookings} label="Total Bookings" />
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-accent/20 hover:border-accent/40 transition-all">
              <CardContent className="pt-6 text-center">
                <Calendar className="w-10 h-10 mx-auto mb-4 text-accent" />
                <CountUpStat end={upcoming} label="Upcoming Sessions" />
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-accent/20 hover:border-accent/40 transition-all">
              <CardContent className="pt-6 text-center">
                <Clock className="w-10 h-10 mx-auto mb-4 text-accent" />
                <CountUpStat end={pendingPayment} label="Pending Actions" />
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-accent/20 hover:border-accent/40 transition-all">
              <CardContent className="pt-6 text-center">
                <CountUpStat 
                  end={totalMoneyPaid} 
                  suffix=" GHS" 
                  label="Total Revenue (Paid)" 
                />
              </CardContent>
            </Card>
          </div>

          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-8 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>

          {/* Bookings Table */}
          {bookings.length === 0 ? (
            <Card className="bg-card/80 backdrop-blur-sm border-accent/20">
              <CardContent className="py-20 text-center">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
                <h3 className="text-2xl font-semibold mb-3">No Mentorship Bookings Found</h3>
                <p className="text-muted-foreground mb-6">No records available at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/80 backdrop-blur-sm border-accent/20 overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl">All Mentorship Bookings</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50 bg-secondary/40 hover:bg-secondary/50">
                        <TableHead className="p-5">Student</TableHead>
                        <TableHead className="p-5">Academic</TableHead>
                        <TableHead className="p-5">Mentor</TableHead>
                        <TableHead className="p-5">Schedule</TableHead>
                        <TableHead className="p-5">Payment</TableHead>
                        <TableHead className="p-5 text-center">Meet</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/40">
                      {bookings.map((booking) => {
                        const { date, time } = formatDateTime(booking.scheduled_at);
                        const mentorDisplayName =
                          booking.mentor.name ||
                          booking.mentor.user?.name ||
                          (booking.mentor.user ? `${booking.mentor.user.first_name} ${booking.mentor.user.last_name}` : 'Unknown Mentor');

                        return (
                          <TableRow key={booking.id} className="hover:bg-secondary/60 transition-colors">
                            <TableCell className="p-5">
                              <div className="font-semibold">{booking.student_name}</div>
                              <div className="text-sm text-muted-foreground mt-0.5">{booking.student_email}</div>
                            </TableCell>
                            <TableCell className="p-5">
                              <div className="text-sm">{booking.student_institution || '—'}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Level {booking.student_level || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="p-5">
                              <div className="font-semibold text-primary">{mentorDisplayName}</div>
                              <div className="text-xs text-muted-foreground mt-1">{booking.mentor.title || 'Mentor'}</div>
                            </TableCell>
                            <TableCell className="p-5 text-sm">
                              <div className="font-medium">{date}</div>
                              <div className="text-xs text-muted-foreground">{time} GMT</div>
                            </TableCell>
                            <TableCell className="p-5">
                              <span className="font-semibold text-accent">
                                GHS {Number(booking.amount).toFixed(2)}
                              </span>
                              {booking.status?.toLowerCase().includes('paid') && (
                                <span className="ml-2 text-xs text-green-500">✓ Paid</span>
                              )}
                            </TableCell>
                            <TableCell className="p-5 text-center">
                              {booking.google_meet_link ? (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={booking.google_meet_link} target="_blank" rel="noopener noreferrer">
                                    <Video className="w-4 h-4 mr-2" />
                                    Join
                                  </a>
                                </Button>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminMentorshipBookings;