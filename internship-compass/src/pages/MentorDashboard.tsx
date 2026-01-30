'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Calendar, Clock, User, Mail, Phone, School, BookOpen, Loader2, ArrowLeft,
  Video, CheckCircle2, MessageSquare, Info, X, CalendarDays, Hash
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Student {
  name: string;
  email: string;
  phone?: string;
  university?: string;
  course?: string;
  level?: string;
  dob?: string;
  topic_description?: string;
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
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, profileRes] = await Promise.all([
          api.get('/api/mentor/bookings'),
          api.get('/api/mentor/profile')
        ]);

        const rawBookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];

        const formatted = rawBookings.map((b: any) => ({
          ...b,
          student: {
            name: b.student?.name || 'Unknown Student',
            email: b.student?.email || '—',
            phone: b.student?.phone,
            university: b.student?.university,
            course: b.student?.course,
            level: b.student?.level,
            dob: b.student?.dob || b.student?.date_of_birth,
            topic_description: b.student?.topic_description,
          }
        }));

        setBookings(formatted);
        setIsGoogleConnected(!!profileRes.data.is_google_connected);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleConnectGoogle = async () => {
    try {
      const res = await api.get('/api/google/connect');
      window.location.href = res.data.url;
    } catch (err: any) {
      toast.error("Could not initiate Google connection");
    }
  };

  const renderTopic = (text?: string) => {
    if (!text) return "No description provided.";
    if (text.length <= 40) return text;

    return (
      <>
        {text.substring(0, 40)}...
        <button 
          onClick={() => setSelectedTopic(text)}
          className="text-primary font-bold ml-1 hover:underline cursor-pointer"
        >
          Read More
        </button>
      </>
    );
  };

  const formatDOB = (dobString?: string) => {
    if (!dobString) return 'N/A';
    try {
      return new Date(dobString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dobString;
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* MODAL FIXED: REMOVED HORIZONTAL SCROLLBAR */}
      {selectedTopic && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setSelectedTopic(null)}
          />
          
          <div className="relative bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm uppercase tracking-tight">Full Topic</h3>
              </div>
              <button onClick={() => setSelectedTopic(null)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area - Added break-words to prevent horizontal scroll */}
            <div className="p-6 overflow-y-auto break-words whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 italic">
              "{selectedTopic}"
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-muted/10 border-t border-border flex justify-end shrink-0">
              <Button onClick={() => setSelectedTopic(null)} size="sm" className="rounded-xl font-bold">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </button>
            <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
            <p className="text-muted-foreground">Manage your students and viewing session details</p>
          </div>
          <div className="bg-primary/10 text-primary px-6 py-2 rounded-full font-bold">
            {bookings.length} Sessions Found
          </div>
        </div>

        {/* GOOGLE CALENDAR CARD */}
        <div className="mb-8 p-6 rounded-2xl border bg-card flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border-l-4 border-l-primary">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${isGoogleConnected ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600'}`}>
              <Video />
            </div>
            <div>
              <h2 className="text-lg font-bold">Google Calendar Integration</h2>
              <p className="text-sm text-muted-foreground">{isGoogleConnected ? 'Google Meet links are automatically generated.' : 'Link your account to generate session links.'}</p>
            </div>
          </div>
          <Button onClick={handleConnectGoogle} variant={isGoogleConnected ? "outline" : "default"} className={isGoogleConnected ? "border-green-200 text-green-700" : ""}>
            {isGoogleConnected ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Google Linked</> : "Connect Google Account"}
          </Button>
        </div>

        {/* BOOKINGS LIST */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="p-6 flex-1 space-y-6">
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{booking.student.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail size={12} /> {booking.student.email}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                    booking.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                <hr className="border-border/50" />

                <div className="grid grid-cols-1 gap-y-3 text-xs">
                  <div className="flex items-center gap-3 text-foreground font-medium">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span>{new Date(booking.scheduled_at).toLocaleDateString()} at {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="w-4 h-4" /> {booking.student.phone || 'N/A'}
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <School className="w-4 h-4" /> <span className="truncate">{booking.student.university}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <BookOpen className="w-4 h-4" /> <span>{booking.student.course}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Hash className="w-4 h-4" /> <span>Level {booking.student.level}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Info className="w-4 h-4" /> <span>DOB: {formatDOB(booking.student.dob)}</span>
                  </div>
                </div>

                <div className="bg-secondary/20 p-4 rounded-xl border border-border/50">
                  <p className="text-[10px] font-bold text-primary uppercase mb-2 flex items-center gap-1">
                    <MessageSquare size={12} /> Student's Topic
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground italic">
                    "{renderTopic(booking.student.topic_description)}"
                  </p>
                </div>
              </div>

              <div className="p-4 bg-secondary/5 border-t border-border">
                {booking.status === 'paid' && booking.google_meet_link ? (
                  <a href={booking.google_meet_link} target="_blank" className="w-full inline-flex justify-center items-center py-3 bg-primary text-white rounded-xl font-bold text-sm gap-2 hover:opacity-90 transition-opacity">
                    <Video size={18} /> Join Google Meet
                  </a>
                ) : (
                  <div className="text-center text-xs text-muted-foreground font-medium py-2">
                    {booking.status === 'paid' ? 'Generating Meet Link...' : 'Link available after payment'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}