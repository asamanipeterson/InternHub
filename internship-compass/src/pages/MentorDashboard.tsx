'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Calendar, Clock, User, Mail, Phone, Cake, School, BookOpen, Loader2, ArrowLeft,
  Video, CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Student {
  name: string;
  email: string;
  phone?: string;
  age?: number;
  university?: string;
  course?: string;
  level?: string;
}

interface Booking {
  id: string;
  student: Student;
  scheduled_at: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'expired';
  google_meet_link?: string;
}

export default function MentorDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get('google') === 'success') {
      toast.success("Google Calendar connected successfully!");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (query.get('google') === 'error') {
      toast.error("Failed to connect Google account.");
    }

    const fetchData = async () => {
      try {
        const [bookingsRes, profileRes] = await Promise.all([
          api.get('/api/mentor/bookings'),
          api.get('/api/mentor/profile')
        ]);

        const rawBookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];

        // Normalize student object (fallback values)
        const formatted = rawBookings.map((b: any) => ({
          ...b,
          student: {
            name: b.student?.name || 'Unknown Student',
            email: b.student?.email || '—',
            phone: b.student?.phone,
            age: b.student?.age,
            university: b.student?.university,
            course: b.student?.course,
            level: b.student?.level,
          }
        }));

        setBookings(formatted);
        setIsGoogleConnected(!!profileRes.data.is_google_connected);
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 403) {
          navigate('/auth');
        } else {
          toast.error("Failed to load dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleConnectGoogle = async () => {
    try {
      const res = await api.get('/api/google/connect');
      const url = res.data.url;
      if (!url) throw new Error('No URL returned from backend');
      window.location.href = url;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Could not initiate Google connection");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
            <p className="text-muted-foreground">Manage your sessions and Google Calendar integration</p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium">
            {bookings.length} Total Sessions
          </div>
        </div>

        {/* GOOGLE CONNECTION CARD */}
        <div className="mb-8 p-6 rounded-2xl border bg-card flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isGoogleConnected ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
              <Video className={isGoogleConnected ? 'text-green-600' : 'text-blue-600'} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Google Calendar & Meet</h2>
              <p className="text-sm text-muted-foreground">
                {isGoogleConnected
                  ? "Connected. Google Meet links will be generated for every paid booking."
                  : "Connect your Google account to automatically generate Meet links for students."}
              </p>
            </div>
          </div>
          <Button
            onClick={handleConnectGoogle}
            variant={isGoogleConnected ? "outline" : "default"}
            className={isGoogleConnected ? "border-green-200 text-green-700" : "bg-blue-600 hover:bg-blue-700 text-white"}
          >
            {isGoogleConnected ? (
              <><CheckCircle2 className="mr-2 h-4 w-4" /> Google Linked</>
            ) : (
              "Connect Google Account"
            )}
          </Button>
        </div>

        {/* BOOKINGS GRID */}
        {bookings.length === 0 ? (
          <div className="bg-card rounded-2xl p-16 text-center border border-dashed border-border">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold">No bookings yet</h2>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{booking.student.name}</h3>
                        <p className="text-sm text-muted-foreground">{booking.student.email}</p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      booking.status === 'paid' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border text-sm">
                    {booking.student.age && (
                      <div className="flex items-center gap-3">
                        <Cake className="h-4 w-4 text-muted-foreground" />
                        <span>Age: {booking.student.age}</span>
                      </div>
                    )}

                    {booking.student.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{booking.student.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{new Date(booking.scheduled_at).toLocaleString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>

                    {booking.student.university && (
                      <div className="flex items-center gap-3">
                        <School className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{booking.student.university}</span>
                      </div>
                    )}

                    {booking.student.course && (
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{booking.student.course}</span>
                      </div>
                    )}

                    {booking.student.level && (
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">Level:</span>
                        <span>{booking.student.level}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{booking.student.email}</span>
                    </div>
                  </div>

                  {booking.status === 'paid' && booking.google_meet_link && (
                    <a
                      href={booking.google_meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 w-full inline-flex justify-center items-center py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Join Google Meet
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}