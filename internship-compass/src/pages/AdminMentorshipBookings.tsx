'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Video, DollarSign, User, School, BookOpen, Layers } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface MentorshipBooking {
  id: string;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  age: number | null;
  student_university: string | null;
  student_course: string | null;
  student_level: string | null;
  mentor_name: string;
  mentor_title: string;
  scheduled_at: string;
  date: string;
  time: string;
  amount: string | number;
  status: string;
  google_meet_link: string | null;   // ← Changed from zoom_join_url
  created_at: string;
}

const AdminMentorshipBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<MentorshipBooking[]>([]);
  const [loading, setLoading] = useState(true);   // ← fixed here

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/api/admin/mentor-bookings');
        
        console.log("Mentorship bookings loaded:", res.data);
        console.log("Count:", res.data.length);

        setBookings(res.data);
      } catch (err: any) {
        console.error("Failed to load mentorship bookings:", err);
        toast.error("Failed to load mentorship bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDateTime = (dateTime: string) => {
    const dt = new Date(dateTime);
    return {
      date: dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Booked Mentorship Sessions
            </h1>
            <p className="text-xl text-muted-foreground mb-12">
              View all confirmed and paid mentorship bookings
            </p>

            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-3xl border border-border">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No Booked Sessions Yet</h3>
                <p className="text-muted-foreground">
                  When students complete payment for mentorship sessions, they will appear here.
                </p>
              </div>
            ) : (
              <div className="bg-card rounded-3xl shadow-elevated overflow-hidden border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-4 font-medium">Student</th>
                        <th className="text-left p-4 font-medium">University</th>
                        <th className="text-left p-4 font-medium">Course</th>
                        <th className="text-left p-4 font-medium">Level</th>
                        <th className="text-left p-4 font-medium">Mentor</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Time</th>
                        <th className="text-left p-4 font-medium">Amount</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-center p-4 font-medium">Google Meet</th> {/* ← Changed header */}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => {
                        const { date, time } = formatDateTime(booking.scheduled_at || booking.created_at);

                        return (
                          <tr 
                            key={booking.id} 
                            className="border-t border-border hover:bg-secondary/50 transition-colors"
                          >
                            {/* Student column */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                  <User className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-medium">{booking.student_name}</p>
                                  <p className="text-sm text-muted-foreground">{booking.student_email}</p>
                                </div>
                              </div>
                            </td>

                            {/* University */}
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <School className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">
                                    {booking.student_university || '—'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Course */}
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-muted-foreground" />
                                <p className="font-medium">
                                  {booking.student_course || '—'}
                                </p>
                              </div>
                            </td>

                            {/* Level */}
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-muted-foreground" />
                                <p className="font-medium">
                                  {booking.student_level || '—'}
                                </p>
                              </div>
                            </td>

                            {/* Mentor */}
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{booking.mentor.name}</p>
                                <p className="text-sm text-muted-foreground">{booking.mentor.title}</p>
                              </div>
                            </td>

                            <td className="p-4 whitespace-nowrap">{date}</td>
                            <td className="p-4 whitespace-nowrap">{time} (GMT)</td>

                            <td className="p-4">
                              <span className="font-medium text-accent">
                                GHS {Number(booking.amount).toFixed(2)}
                              </span>
                            </td>

                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'paid' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>

                            <td className="p-4 text-center">
                              {booking.google_meet_link ? (   // ← Changed field name
                                <a
                                  href={booking.google_meet_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent hover:underline inline-flex items-center gap-1"
                                >
                                  <Video className="w-4 h-4" />
                                  Join Google Meet
                                </a>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminMentorshipBookings;