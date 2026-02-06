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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    student_email: "",
    phone: "",
    date_of_birth: null as Date | null,
    student_institution: "",
    student_course: "",
    student_level: "",
    topic_description: "",
    scheduled_at: ""
  });

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/student/profile");
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchUser();
  }, []);

  // Fetch mentor
  useEffect(() => {
    if (!uuid) {
      toast.error("Invalid mentor link");
      navigate("/mentorship");
      return;
    }

    const fetchMentor = async () => {
      try {
        const res = await api.get(`/api/mentors/${uuid}`);
        setMentor(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Mentor not found");
        navigate("/mentorship");
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
  }, [uuid, navigate]);

  const openBookingDialog = () => {
    if (!mentor) return;

    setSelectedDate(null);
    setAvailableTimes([]);

    setFormData({
      first_name: currentUser?.first_name || "",
      last_name: currentUser?.last_name || "",
      student_email: currentUser?.email || "",
      phone: currentUser?.phone || currentUser?.phone_number || "",
      date_of_birth: currentUser?.date_of_birth ? new Date(currentUser.date_of_birth) : null,
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

    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.student_email.trim() ||
      !formData.phone.trim() ||
      !formData.date_of_birth ||
      !formData.student_institution.trim() ||
      !formData.student_course.trim() ||
      !formData.student_level.trim() ||
      !formData.topic_description.trim() ||
      !formData.scheduled_at
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setBookingLoading(true);
    try {
      const response = await api.post("/api/mentor/book/initiate", {
        mentor_id: mentor.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        student_email: formData.student_email,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth?.toISOString().split("T")[0],
        student_institution: formData.student_institution,
        student_course: formData.student_course,
        student_level: formData.student_level,
        topic_description: formData.topic_description,
        scheduled_at: formData.scheduled_at
      });

      if (response.data.success) {
        toast.info("Redirecting to payment...");
        window.location.href = response.data.authorization_url;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const goBackToMentorship = () => {
    navigate("/mentorship");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-lg text-primary-foreground/80">Loading mentor profile...</p>
        </div>
      </div>
    );
  }

  if (!mentor) return null;

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
                <Label>First Name *</Label>
                <Input
                  value={formData.first_name}
                  disabled={!!currentUser?.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                  className={currentUser?.first_name ? "bg-secondary/50 cursor-not-allowed" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label>Last Name *</Label>
                <Input
                  value={formData.last_name}
                  disabled={!!currentUser?.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                  className={currentUser?.last_name ? "bg-secondary/50 cursor-not-allowed" : ""}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.student_email}
                disabled={!!currentUser?.email}
                onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                placeholder="john.doe@example.com"
                className={currentUser?.email ? "bg-secondary/50 cursor-not-allowed" : ""}
              />
            </div>

            <div className="grid gap-2">
              <Label>Phone Number *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+233 24 123 4567"
              />
            </div>

            <div className="grid gap-2">
              <Label>Date of Birth *</Label>
              <div className="relative">
                <DatePicker
                  selected={formData.date_of_birth}
                  onChange={(date: Date | null) => setFormData({ ...formData, date_of_birth: date })}
                  dateFormat="yyyy-MM-dd"
                  maxDate={new Date()}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  placeholderText="Select your date of birth"
                  className="w-full px-4 py-2 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  calendarClassName="bg-card border border-border shadow-lg rounded-md"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Institution *</Label>
              <Input
                value={formData.student_institution}
                onChange={(e) => setFormData({ ...formData, student_institution: e.target.value })}
                placeholder="University of Ghana / Ashesi University"
              />
            </div>

            <div className="grid gap-2">
              <Label>Programme / Course *</Label>
              <Input
                value={formData.student_course}
                onChange={(e) => setFormData({ ...formData, student_course: e.target.value })}
                placeholder="BSc Computer Science"
              />
            </div>

            <div className="grid gap-2">
              <Label>Level / Year *</Label>
              <Input
                value={formData.student_level}
                onChange={(e) => setFormData({ ...formData, student_level: e.target.value })}
                placeholder="Level 300 / 3rd Year"
              />
            </div>

            <div className="grid gap-2">
              <Label>What would you like to discuss? *</Label>
              <Textarea
                value={formData.topic_description}
                onChange={(e) => setFormData({ ...formData, topic_description: e.target.value })}
                placeholder="e.g. Career transition advice, resume & LinkedIn optimization, interview preparation for product management roles, salary negotiation strategies..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-2">
              <Label>Preferred Date *</Label>
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => {
                    if (date) {
                      const dateStr = date.toISOString().split("T")[0];
                      setSelectedDate(date);
                      setFormData({ ...formData, scheduled_at: "" });

                      if (mentor) {
                        api
                          .get(`/api/mentors/${mentor.uuid}/available-slots?date=${dateStr}`)
                          .then((res) => setAvailableTimes(res.data || []))
                          .catch(() => {
                            setAvailableTimes([]);
                            toast.error("Could not load available times");
                          });
                      }
                    } else {
                      setSelectedDate(null);
                      setFormData({ ...formData, scheduled_at: "" });
                      setAvailableTimes([]);
                    }
                  }}
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                  placeholderText="Select preferred date"
                  className="w-full px-4 py-2 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  calendarClassName="bg-card border border-border shadow-lg rounded-md"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {selectedDate && (
              <div className="grid gap-2">
                <Label>Available Time Slots <span className="text-red-600">*</span></Label>

                {availableTimes.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 py-1">
                      {availableTimes.map((time) => {
                        const isSelected = formData.scheduled_at === `${selectedDate.toISOString().split("T")[0]}T${time}`;
                        return (
                          <Button
                            key={time}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={`
                              transition-all duration-200
                              ${isSelected 
                                ? "bg-accent text-base shadow-md" 
                                : "hover:bg-accent/30 hover:border-accent/50 border-foreground/50"}
                              rounded-lg py-5 text-base font-medium
                            `}
                            onClick={() => 
                              setFormData({ 
                                ...formData, 
                                scheduled_at: `${selectedDate.toISOString().split("T")[0]}T${time}` 
                              })
                            }
                          >
                            {time}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-6 bg-secondary/30 rounded-lg border border-border/50">
                    No available time slots on this date
                  </div>
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
              disabled={bookingLoading || !formData.scheduled_at}
            >
              {bookingLoading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorProfile;