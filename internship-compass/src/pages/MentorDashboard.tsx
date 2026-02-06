'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Calendar, User, Mail, Phone, School, BookOpen, Loader2, ArrowLeft,
  Video, CheckCircle2, MessageSquare, Info, X, CalendarDays, Hash, AlertTriangle, RefreshCcw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Navbar } from '@/components/layout/Navbar';

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

const ITEMS_PER_PAGE = 12;

export default function MentorDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [displayedBookings, setDisplayedBookings] = useState<Booking[]>([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
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
            name: b.student_name || b.student?.name || 'Unknown Student',
            email: b.student_email || b.student?.email || '—',
            phone: b.student_phone || b.phone || b.student?.phone,
            university: b.student_university || b.student_institution || b.student?.university,
            course: b.student_course || b.student?.course,
            level: b.student_level || b.student?.level,
            dob: b.date_of_birth || b.student?.dob || b.student?.date_of_birth,
            topic_description: b.topic_description || b.student?.topic_description,
          }
        }));

        setBookings(formatted);
        setDisplayedBookings(formatted.slice(0, ITEMS_PER_PAGE));
        setIsGoogleConnected(!!profileRes.data.is_google_connected);
        setIsTokenExpired(profileRes.data.google_token_status === 'invalid');
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Update displayed bookings when visibleCount changes
    setDisplayedBookings(bookings.slice(0, visibleCount));
  }, [visibleCount, bookings]);

  const handleConnectGoogle = async () => {
    try {
      const res = await api.get('/api/google/connect?reconnect=true');
      window.location.href = res.data.url;
    } catch (err: any) {
      toast.error("Could not initiate Google connection");
    }
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const renderTopic = (text?: string) => {
    if (!text || text === "NULL") return "No description provided.";
    if (text.length <= 60) return text;
    return (
      <>
        {text.substring(0, 60)}...
        <button
          onClick={() => setSelectedTopic(text)}
          className="text-accent font-semibold ml-1.5 hover:underline cursor-pointer"
        >
          more
        </button>
      </>
    );
  };

  const formatDOB = (dobString?: string) => {
    if (!dobString || dobString === "NULL") return 'N/A';
    try {
      const date = new Date(dobString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-lg text-primary-foreground/80">Loading mentor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar/>

      {selectedTopic && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedTopic(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] z-10"
          >
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-base">Session Topic</h3>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-sm leading-relaxed text-foreground/90 italic whitespace-pre-wrap">
              "{selectedTopic}"
            </div>
            <div className="px-6 py-4 bg-muted/20 border-t border-border flex justify-end">
              <Button onClick={() => setSelectedTopic(null)} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}

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
              Mentor{' '}
              <span className="relative inline-block">
                <span className="text-accent">Dashboard</span>
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-1.5 bg-accent rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-primary-foreground/80 text-lg md:text-xl"
            >
              Manage your mentoring sessions, view student details, and handle Google Calendar integration
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Google Integration Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`mb-10 p-6 rounded-2xl border bg-card/80 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border-l-4 ${
            isTokenExpired
              ? 'border-l-destructive bg-destructive/5'
              : isGoogleConnected
              ? 'border-l-green-500 bg-green-500/5'
              : 'border-l-accent bg-accent/5'
          }`}
        >
          <div className="flex items-center gap-5">
            <div
              className={`p-4 rounded-xl ${
                isTokenExpired
                  ? 'bg-destructive/10 text-destructive'
                  : isGoogleConnected
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-accent/10 text-accent'
              }`}
            >
              {isTokenExpired ? <AlertTriangle size={28} /> : <Video size={28} />}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {isTokenExpired ? 'Reconnect Google Calendar' : 'Google Integration'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                {isTokenExpired
                  ? 'Your Google connection has expired. Reconnect to continue generating Meet links.'
                  : isGoogleConnected
                  ? 'Your Google account is connected — Meet links are generated automatically.'
                  : 'Connect your Google account to automatically create Google Meet links for sessions.'}
              </p>
            </div>
          </div>

          <Button
            onClick={handleConnectGoogle}
            variant={isTokenExpired ? 'destructive' : isGoogleConnected ? 'outline' : 'default'}
            size="lg"
            className="rounded-xl px-8"
          >
            {isTokenExpired ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" /> Reconnect
              </>
            ) : isGoogleConnected ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Connected
              </>
            ) : (
              'Connect Google'
            )}
          </Button>
        </motion.div>

        {/* Session Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedBookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              <div className="p-6 flex-1 space-y-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <User size={26} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{booking.student.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{booking.student.email}</p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      booking.status === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700/30'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-accent" />
                    <span>
                      {new Date(booking.scheduled_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {booking.student.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{booking.student.phone}</span>
                    </div>
                  )}

                  {booking.student.university && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <School className="w-4 h-4" />
                      <span className="truncate">{booking.student.university}</span>
                    </div>
                  )}

                  {booking.student.course && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>{booking.student.course}</span>
                    </div>
                  )}

                  {booking.student.level && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Hash className="w-4 h-4" />
                      Level {booking.student.level}
                    </div>
                  )}
                </div>

                <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                  <p className="text-xs font-semibold text-accent uppercase mb-2 flex items-center gap-2">
                    <MessageSquare size={14} /> Topic
                  </p>
                  <div className="text-sm leading-relaxed text-muted-foreground italic">
                    "{renderTopic(booking.student.topic_description)}"
                  </div>
                </div>
              </div>

              <div className="p-5 bg-muted/20 border-t border-border mt-auto">
                {booking.status === 'paid' && booking.google_meet_link && booking.google_meet_link !== 'NULL' ? (
                  <a
                    href={booking.google_meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex justify-center items-center py-3 bg-accent text-accent-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Video className="mr-2 h-4 w-4" /> Join Meeting
                  </a>
                ) : (
                  <div className="text-center text-sm text-muted-foreground font-medium">
                    {booking.status === 'paid' ? 'Preparing meeting link...' : 'Link available after confirmation'}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {visibleCount < bookings.length && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={loadMore}
              className="px-10"
            >
              Load More Sessions
            </Button>
          </div>
        )}

        {bookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
            <h3 className="text-2xl font-semibold mb-3">No sessions yet</h3>
            <p className="text-muted-foreground">When students book sessions with you, they will appear here.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}