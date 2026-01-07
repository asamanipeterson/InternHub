'use client';

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Clock, Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";

interface Mentor {
  id: string;
  uuid: string;
  name: string;
  title: string;
  specialization: string | null;
  bio: string | null;
  image: string | null;
  experience: number;
  rating: number | string;
  session_price: number | string;
}

const MentorProfile = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Dialog State
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    student_name: "",
    student_email: "",
    student_phone: "",
    scheduled_at: ""
  });

  useEffect(() => {
    if (!uuid) {
      toast.error("Invalid mentor link");
      navigate("/mentorship");
      return;
    }

    api.get(`/api/mentors/${uuid}`)
      .then(res => {
        setMentor(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        toast.error("Mentor not found");
        navigate("/mentorship");
      });
  }, [uuid, navigate]);

  const openBookingDialog = () => {
    if (!mentor) return;
    setSelectedDate("");
    setAvailableTimes([]);
    setFormData({ student_name: "", student_email: "", student_phone: "", scheduled_at: "" });
    setOpen(true);
  };

  const handleSubmitBooking = async () => {
    if (!mentor) return;

    if (!formData.student_name || !formData.student_email || !formData.scheduled_at) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await api.post("/api/mentor/book/initiate", {
        mentor_id: mentor.id,
        student_name: formData.student_name,
        student_email: formData.student_email,
        student_phone: formData.student_phone,
        scheduled_at: formData.scheduled_at
      });

      if (response.data.success) {
        toast.success("Redirecting to payment...");
        window.location.href = response.data.authorization_url;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Booking failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading mentor profile...</p>
      </div>
    );
  }

  if (!mentor) {
    return null;
  }

  const safeRating = Number(mentor.rating) || 0;
  const safePrice = Number(mentor.session_price) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 gradient-hero relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-card rounded-3xl shadow-elevated overflow-hidden border border-border">
              <div className="md:flex">
                {/* Image Section */}
                <div className="md:w-1/3 relative h-96 md:h-auto">
                  {mentor.image ? (
                    <img 
                      src={`/${mentor.image}`} 
                      alt={mentor.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <span className="text-9xl text-white/90">👤</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent fill-accent" />
                    <span className="font-bold text-lg">
                      {safeRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="md:w-2/3 p-8 md:p-12">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{mentor.name}</h1>
                  <p className="text-2xl text-accent mb-6">{mentor.title}</p>

                  <div className="flex flex-wrap gap-4 mb-8">
                    <span className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
                      <Award className="w-5 h-5" />
                      {mentor.specialization || "Career Expert"}
                    </span>
                    <span className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
                      <Clock className="w-5 h-5" />
                      {mentor.experience}+ years experience
                    </span>
                  </div>

                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {mentor.bio || "Dedicated professional mentor helping students and young professionals achieve their career goals."}
                  </p>

                  <div className="border-t pt-8">
                    <div className="flex items-end justify-between mb-8">
                      <div>
                        <p className="text-muted-foreground mb-2">1-on-1 Session Fee</p>
                        <p className="text-5xl font-bold text-accent">
                          GHS {safePrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <Button 
                      variant="accent" 
                      size="xl" 
                      className="w-full py-8 text-xl rounded-2xl"
                      onClick={openBookingDialog}
                    >
                      <Calendar className="w-6 h-6 mr-3" />
                      Book Session Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Dialog with Calendar Picker */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Session with {mentor.name}</DialogTitle>
            <DialogDescription>
              Session fee: <strong>GHS {safePrice.toFixed(2)}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.student_name}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.student_email}
                onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                value={formData.student_phone}
                onChange={(e) => setFormData({ ...formData, student_phone: e.target.value })}
                placeholder="+233 123 456 789"
              />
            </div>

            <div className="grid gap-2">
              <Label>Preferred Date *</Label>
              <Input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={async (e) => {
                  const date = e.target.value;
                  setSelectedDate(date);
                  setFormData({ ...formData, scheduled_at: "" });
                  if (date) {
                    try {
                      const res = await api.get(`/api/mentors/${mentor.uuid}/available-slots?date=${date}`);
                      setAvailableTimes(res.data);
                    } catch {
                      setAvailableTimes([]);
                      toast.error("Could not load available times");
                    }
                  }
                }}
              />
            </div>

            {selectedDate && (
              <div className="grid gap-2">
                <Label>Available Time *</Label>
                {availableTimes.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map(time => (
                      <Button
                        key={time}
                        variant={formData.scheduled_at === `${selectedDate}T${time}:00` ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData({ ...formData, scheduled_at: `${selectedDate}T${time}:00` })}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    No available time slots on this date
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="accent" 
              onClick={handleSubmitBooking}
              disabled={!formData.scheduled_at}
            >
              Proceed to Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MentorProfile;