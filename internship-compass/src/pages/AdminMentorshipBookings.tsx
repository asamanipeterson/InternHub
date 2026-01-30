'use client';

import { useState, useEffect } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Calendar, Clock, Video, User, School, BookOpen, Layers } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

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
    name: string | null;      // Added this
    title: string;
    user?: {
      name: string | null;    // Added this
      first_name: string;
      last_name: string;
    }
  };
}

const AdminMentorshipBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<MentorshipBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/api/admin/mentor-bookings');
        setBookings(res.data);
      } catch (err: any) {
        console.error("Failed to load bookings:", err);
        toast.error("Failed to load mentorship bookings");
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg">Loading records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>

            <h1 className="text-4xl font-bold mb-12">Mentorship Administration</h1>

            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-3xl border border-dashed">
                <p>No Records Found</p>
              </div>
            ) : (
              <div className="bg-card rounded-3xl shadow-sm overflow-hidden border">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-secondary/50 border-b">
                      <tr>
                        <th className="text-left p-5">Student</th>
                        <th className="text-left p-5">Academic</th>
                        <th className="text-left p-5">Mentor</th>
                        <th className="text-left p-5">Schedule</th>
                        <th className="text-left p-5">Payment</th>
                        <th className="text-center p-5">Meet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bookings.map((booking) => {
                        const { date, time } = formatDateTime(booking.scheduled_at);
                        
                        // FALLBACK LOGIC: Try mentor.name, then mentor.user.name, then manual combine
                        const mentorDisplayName = 
                            booking.mentor.name || 
                            booking.mentor.user?.name || 
                            (booking.mentor.user ? `${booking.mentor.user.first_name} ${booking.mentor.user.last_name}` : 'Unknown Mentor');

                        return (
                          <tr key={booking.id} className="hover:bg-secondary/30 transition-colors">
                            <td className="p-5">
                              <p className="font-bold">{booking.student_name}</p>
                              <p className="text-xs text-muted-foreground">{booking.student_email}</p>
                            </td>
                            <td className="p-5">
                              <p className="text-sm">{booking.student_institution}</p>
                              <p className="text-xs font-medium uppercase text-muted-foreground">Level {booking.student_level}</p>
                            </td>
                            <td className="p-5">
                              <div className="flex flex-col">
                                <span className="font-semibold text-primary">{mentorDisplayName}</span>
                                <span className="text-xs text-muted-foreground">{booking.mentor.title}</span>
                              </div>
                            </td>
                            <td className="p-5 text-sm">
                              <div className="font-medium">{date}</div>
                              <div className="text-xs text-muted-foreground">{time} GMT</div>
                            </td>
                            <td className="p-5">
                              <span className="font-bold">GHS {Number(booking.amount).toFixed(2)}</span>
                            </td>
                            <td className="p-5 text-center">
                              {booking.google_meet_link ? (
                                <a href={booking.google_meet_link} target="_blank" className="text-accent hover:underline text-sm font-medium">Join Meet</a>
                              ) : <span className="text-xs text-muted-foreground italic">Pending</span>}
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