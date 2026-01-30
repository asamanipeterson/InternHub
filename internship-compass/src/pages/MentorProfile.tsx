'use client';

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Clock, Award, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { toast } from "sonner";

interface Mentor {
  id: string;
  uuid: string;
  title: string;
  specialization: string | null;
  bio: string | null;
  image: string | null;
  experience: number;
  rating: number | string;
  session_price: number | string;
  user: {
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    email: string;
  };
}

const MentorProfile = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    student_email: "",
    phone: "",
    date_of_birth: "",
    student_institution: "",
    student_course: "",
    student_level: "",
    topic_description: "",
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
    setFormData({
      first_name: "",
      last_name: "",
      student_email: "",
      phone: "",
      date_of_birth: "",
      student_institution: "",
      student_course: "",
      student_level: "",
      topic_description: "",
      scheduled_at: ""
    });
    setOpen(true);
  };

  const handleSubmitBooking = async () => {
    if (!mentor) return;

    if (!formData.first_name.trim() ||
        !formData.last_name.trim() ||
        !formData.student_email.trim() ||
        !formData.phone.trim() ||
        !formData.date_of_birth ||
        !formData.student_institution.trim() ||
        !formData.student_course.trim() ||
        !formData.student_level.trim() ||
        !formData.topic_description.trim() ||
        !formData.scheduled_at) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await api.post("/api/mentor/book/initiate", {
        mentor_id: mentor.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        student_email: formData.student_email,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        student_institution: formData.student_institution,
        student_course: formData.student_course,
        student_level: formData.student_level,
        topic_description: formData.topic_description,
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

  const goBackToMentorship = () => {
    navigate("/mentorship");
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

  const fullName = [
    mentor.user?.first_name || "",
    mentor.user?.middle_name || "",
    mentor.user?.last_name || ""
  ].filter(Boolean).join(" ") || "Mentor Name";

  const safeRating = Number(mentor.rating) || 0;
  const safePrice = Number(mentor.session_price) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 bg-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 text-lg font-medium border text-background"
                onClick={goBackToMentorship}
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Mentorship
              </Button>
            </div>

            <div className="bg-card rounded-3xl overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 relative h-96 md:h-auto">
                  {mentor.image ? (
                    <img
                      src={`/${mentor.image}`}
                      alt={fullName}
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

                <div className="md:w-2/3 p-8 md:p-12">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{fullName}</h1>
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
      </main>

      <Footer />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Session with {fullName}</DialogTitle>
            <DialogDescription>
              Session fee: <strong>GHS {safePrice.toFixed(2)}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name (Surname) *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.student_email}
                onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+233 24 123 4567"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="institution">Institution *</Label>
              <Input
                id="institution"
                value={formData.student_institution}
                onChange={(e) => setFormData({ ...formData, student_institution: e.target.value })}
                placeholder="University of Ghana / Ashesi University"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course">Programme / Course *</Label>
              <Input
                id="course"
                value={formData.student_course}
                onChange={(e) => setFormData({ ...formData, student_course: e.target.value })}
                placeholder="BSc Computer Science"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="level">Level / Year *</Label>
              <Input
                id="level"
                value={formData.student_level}
                onChange={(e) => setFormData({ ...formData, student_level: e.target.value })}
                placeholder="Level 300 / 3rd Year"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="topic_description">What would you like to discuss? *</Label>
              <Textarea
                id="topic_description"
                value={formData.topic_description}
                onChange={(e) => setFormData({ ...formData, topic_description: e.target.value })}
                placeholder="e.g. Career transition advice, resume & LinkedIn optimization, interview preparation for product management roles, salary negotiation strategies..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-2">
              <Label>Preferred Date *</Label>
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={async (e) => {
                  const date = e.target.value;
                  setSelectedDate(date);
                  setFormData({ ...formData, scheduled_at: "" });
                  if (date) {
                    try {
                      const res = await api.get(`/api/mentors/${mentor.uuid}/available-slots?date=${date}`);
                      setAvailableTimes(res.data || []);
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
                <Label>Available Time Slots *</Label>
                {availableTimes.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {availableTimes.map(time => (
                      <Button
                        key={time}
                        variant={formData.scheduled_at === `${selectedDate}T${time}` ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData({ ...formData, scheduled_at: `${selectedDate}T${time}` })}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No available time slots on this date
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
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
    </div>
  );
};

export default MentorProfile;