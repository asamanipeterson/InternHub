import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Calendar, Clock, User, Mail, Loader2 } from 'lucide-react';

interface Booking {
  id: string;
  student: {
    name: string;
    email: string;
    university: string;
    course?: string;
    phone?: string;
  };
  scheduled_at: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'expired';
  zoom_join_url?: string;
}

export default function MentorDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // FIXED URL: Added /api prefix to match Laravel's default routing
        const res = await api.get('/api/mentor/bookings');
        setBookings(res.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          toast.error("Access denied. Mentor privileges required.");
          navigate('/auth');
        } else if (err.response?.status === 404) {
          toast.error("Mentor profile not found.");
        } else {
          toast.error("Failed to load your bookings");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

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
            <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
            <p className="text-muted-foreground">Manage your upcoming student sessions</p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium">
            {bookings.length} Total Sessions
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-card rounded-2xl p-16 text-center border border-dashed border-border">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold">No bookings yet</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Your mentorship sessions will appear here once students complete their payment.
            </p>
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
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      booking.status === 'paid' ? 'bg-green-500/10 text-green-600' :
                      booking.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-1">{booking.student.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{booking.student.university}</p>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {new Date(booking.scheduled_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })} at {new Date(booking.scheduled_at).toLocaleTimeString([], {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{booking.student.email}</span>
                    </div>
                  </div>

                  {booking.status === 'paid' && booking.zoom_join_url && (
                    <a
                      href={booking.zoom_join_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 w-full inline-flex justify-center items-center py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm"
                    >
                      Join Zoom Meeting
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