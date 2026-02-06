'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Star,
  Award,
  Clock,
  Calendar,
  Sparkles,
  Target,
  Users,
  Lightbulb,
  Rocket,
  MessageCircle,
  User,
  LogIn,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const MentorSkeleton = () => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -10, scale: 1.02 }}
    className="group"
  >
    <div className="bg-card rounded-3xl overflow-hidden shadow-elegant hover:shadow-elevated transition-all duration-500 border border-border/50">
      <div className="relative h-56 bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.8 }}
        />
        <motion.span
          className="text-8xl relative z-10"
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
          whileHover={{ scale: 1.2, rotate: [0, -15, 15, -15, 15, 0], transition: { duration: 0.6 } }}
        >
          👤
        </motion.span>
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Star className="w-4 h-4 text-accent fill-accent" />
          <span className="text-sm font-bold text-foreground">—.—</span>
        </div>
      </div>
      <div className="p-6">
        <div className="h-6 bg-secondary rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-secondary/60 rounded w-1/2 mb-4"></div>
        <div className="flex gap-3 mb-6">
          <div className="h-8 bg-secondary/40 rounded-full w-32"></div>
          <div className="h-8 bg-secondary/40 rounded-full w-24"></div>
        </div>
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-secondary/30 rounded w-full"></div>
          <div className="h-4 bg-secondary/30 rounded w-4/5"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-12 bg-secondary/40 rounded-xl flex-1"></div>
          <div className="h-12 w-12 bg-secondary/40 rounded-xl"></div>
        </div>
      </div>
    </div>
  </motion.div>
);

const Mentorship = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(1);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bioOpen, setBioOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedBioMentor, setSelectedBioMentor] = useState<Mentor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const [currentUser, setCurrentUser] = useState<any>(null);

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
    scheduled_at: "",
  });

  // Responsive carousel items
  useEffect(() => {
    const updateItemsToShow = () => {
      const width = window.innerWidth;
      if (width >= 1024) setItemsToShow(3);
      else if (width >= 768) setItemsToShow(2);
      else setItemsToShow(1);
      setCurrentIndex(0);
    };

    updateItemsToShow();
    window.addEventListener("resize", updateItemsToShow);
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, []);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/student/profile");
        setCurrentUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        setIsAuthenticated(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch mentors
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await api.get("/api/mentors");
        setMentors(response.data || []);
      } catch (err: any) {
        toast.error("Failed to load mentors");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const canGoNext = currentIndex < mentors.length - itemsToShow;
  const canGoPrev = currentIndex > 0;

  const nextSlide = () => {
    if (canGoNext) setCurrentIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    if (canGoPrev) setCurrentIndex(prev => prev - 1);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold && canGoNext) nextSlide();
    else if (info.offset.x > threshold && canGoPrev) prevSlide();
  };

  const openBookingDialog = (mentor: Mentor) => {
    setSelectedMentor(mentor);
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
      scheduled_at: "",
    });

    setBookingOpen(true);
  };

  const openBioDialog = (mentor: Mentor) => {
    setSelectedBioMentor(mentor);
    setBioOpen(true);
  };

  const handleSubmitBooking = async () => {
    if (!selectedMentor) return;

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
        mentor_id: selectedMentor.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        student_email: formData.student_email,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth?.toISOString().split("T")[0],
        student_institution: formData.student_institution,
        student_course: formData.student_course,
        student_level: formData.student_level,
        topic_description: formData.topic_description,
        scheduled_at: formData.scheduled_at,
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

  const goToProfile = (mentor: Mentor) => {
    navigate(`/mentorship/mentor/${mentor.uuid}`);
  };

  const getFullName = (mentor: Mentor) => {
    const parts = [
      mentor.user?.first_name || "",
      mentor.user?.middle_name || "",
      mentor.user?.last_name || ""
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Mentor Name";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-lg text-primary-foreground/80">Loading available mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 gradient-hero relative overflow-hidden">
        <motion.div
          className="absolute top-10 right-[5%] w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-[10%] w-72 h-72 rounded-full bg-accent/5 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/20 text-accent-foreground mb-8"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Expert Career Guidance</span>
            </motion.span>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-8 leading-tight">
              Transform Your Career with{" "}
              <span className="relative inline-block">
                <span className="text-accent">Expert Mentorship</span>
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1.5 bg-accent rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-primary-foreground/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Connect with industry-leading mentors who will guide you through every step of your professional journey.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <Target className="w-5 h-5 text-accent" />
                <span>Personalized Guidance</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <Users className="w-5 h-5 text-accent" />
                <span>1-on-1 Sessions</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <Rocket className="w-5 h-5 text-accent" />
                <span>Career Acceleration</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="hsl(var(--secondary))"
              fillOpacity="0.3"
            />
          </svg>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="py-32">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <LogIn className="w-20 h-20 text-accent mx-auto mb-8" />
              <h2 className="text-4xl font-bold mb-6">Create an account to access our mentorship services</h2>
              <p className="text-xl text-muted-foreground mb-10">
                Expert mentorship is only available to registered users. Sign up to connect with top professionals!
              </p>
              <Button variant="accent" size="lg" className="px-10 py-6 text-lg" onClick={() => navigate("/auth")}>
                Register
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {isAuthenticated && (
        <>
          <section className="py-12 bg-secondary/30">
            <div className="container mx-auto px-4 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8"
              >
                {[
                  { value: mentors.length + "+", label: "Expert Mentors" },
                  { value: "5K+", label: "Students Mentored" },
                  { value: "98%", label: "Satisfaction Rate" },
                  { value: "24/7", label: "Support Available" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-4xl lg:text-5xl font-bold text-accent mb-2">{stat.value}</div>
                    <div className="text-muted-foreground font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          <section className="py-20">
            <div className="container mx-auto px-4 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  Meet Our <span className="text-accent">Expert Mentors</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Industry professionals with years of experience ready to help you succeed
                </p>
              </motion.div>

              <div className="relative group max-w-7xl mx-auto">
                <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 z-30 pointer-events-none">
                  <AnimatePresence>
                    {canGoPrev && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          variant="accent"
                          size="icon"
                          className="rounded-full h-12 w-12 shadow-xl pointer-events-auto"
                          onClick={prevSlide}
                        >
                          <ChevronLeft className="w-8 h-8" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 z-30 pointer-events-none">
                  <AnimatePresence>
                    {canGoNext && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          variant="accent"
                          size="icon"
                          className="rounded-full h-12 w-12 shadow-xl pointer-events-auto"
                          onClick={nextSlide}
                        >
                          <ChevronRight className="w-8 h-8" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="overflow-hidden">
                  <motion.div
                    className="flex touch-pan-y"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    animate={{ x: `-${currentIndex * (100 / itemsToShow)}%` }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  >
                    {mentors.map((mentor) => {
                      const fullName = getFullName(mentor);
                      const bioText = mentor.bio || "Dedicated mentor committed to your career success.";
                      const isLongBio = bioText.length > 30;
                      const truncatedBio = isLongBio ? bioText.substring(0, 30) + "..." : bioText;

                      return (
                        <div key={mentor.id} className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] p-4">
                          <motion.div
                            variants={itemVariants}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="group"
                          >
                            <div
                              className="bg-card rounded-3xl overflow-hidden shadow-elegant hover:shadow-elevated transition-all duration-500 border border-border/50 cursor-pointer"
                              onClick={() => goToProfile(mentor)}
                            >
                              <div className="relative h-56 bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center overflow-hidden">
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0"
                                  initial={{ x: "-100%" }}
                                  whileHover={{ x: "100%" }}
                                  transition={{ duration: 0.8 }}
                                />
                                {mentor.image ? (
                                  <img
                                    src={`/${mentor.image}`}
                                    alt={fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <motion.span
                                    className="text-8xl relative z-10"
                                    whileHover={{
                                      scale: 1.2,
                                      rotate: [0, -15, 15, -15, 15, 0],
                                      transition: { duration: 0.6, type: "spring", stiffness: 300 },
                                    }}
                                  >
                                    👤
                                  </motion.span>
                                )}
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                  <Star className="w-4 h-4 text-accent fill-accent" />
                                  <span className="text-sm font-bold text-foreground">
                                    {Number(mentor.rating).toFixed(1)}
                                  </span>
                                </div>
                              </div>

                              <div className="p-6">
                                <div className="mb-4">
                                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                                    {fullName}
                                  </h3>
                                  <p className="text-accent font-semibold">{mentor.title}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                                  <span className="flex items-center gap-1.5 bg-secondary px-3 py-1 rounded-full">
                                    <Award className="w-3.5 h-3.5 text-primary" />
                                    {mentor.specialization || "General"}
                                  </span>
                                  <span className="flex items-center gap-1.5 bg-secondary px-3 py-1 rounded-full">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                    {mentor.experience}+ yrs
                                  </span>
                                </div>

                                <div className="mb-6">
                                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 min-h-[3rem]">
                                    {truncatedBio}
                                  </p>
                                  {isLongBio && (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="text-accent hover:text-accent/80 p-0 mt-1 h-auto font-medium"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openBioDialog(mentor);
                                      }}
                                    >
                                      Read More
                                    </Button>
                                  )}
                                </div>

                                <div className="mb-4 text-center">
                                  <p className="text-sm text-muted-foreground">Session Fee</p>
                                  <p className="text-3xl font-bold text-accent">
                                    GHS {(Number(mentor.session_price) || 0).toFixed(2)}
                                  </p>
                                </div>

                                <div className="flex gap-3">
                                  <Button
                                    variant="accent"
                                    size="default"
                                    className="flex-1 rounded-xl"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openBookingDialog(mentor);
                                    }}
                                  >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Book Session
                                  </Button>
                                  <Button variant="outline" size="icon" className="rounded-xl">
                                    <MessageCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </motion.div>
                </div>

                {!mentors.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                  >
                    <User className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold mb-4">No mentors available yet</h3>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                      We're working hard to bring you top industry experts. Check back soon!
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </section>

          <section className="py-20 bg-secondary/30">
            <div className="container mx-auto px-4 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  Mentorship <span className="text-accent">Services</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Comprehensive career guidance tailored to your unique goals
                </p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {[
                  { icon: Target, title: "Career Planning", description: "Personalized roadmap to help you identify and achieve your career goals.", color: "text-accent" },
                  { icon: "📝", title: "Resume & Portfolio", description: "Expert feedback to make your resume stand out to top employers.", isEmoji: true },
                  { icon: MessageCircle, title: "Interview Mastery", description: "Mock interviews and coaching to boost your confidence.", color: "text-primary" },
                  { icon: Lightbulb, title: "Industry Insights", description: "Deep knowledge of trends and what employers are looking for.", color: "text-accent" },
                  { icon: Users, title: "Networking Strategy", description: "Build meaningful professional connections that last.", color: "text-primary" },
                  { icon: Rocket, title: "Career Acceleration", description: "Fast-track your growth with proven strategies.", color: "text-accent" },
                ].map((service, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03, y: -8 }}
                    className="bg-card p-8 rounded-3xl shadow-elegant hover:shadow-elevated transition-all duration-300 border border-border/50 group"
                  >
                    <motion.div
                      className="mb-6"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {service.isEmoji ? (
                        <span className="text-5xl block">{service.icon}</span>
                      ) : (
                        <div className={`w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center ${service.color}`}>
                          <service.icon className="w-7 h-7" />
                        </div>
                      )}
                    </motion.div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          <section className="py-20 gradient-hero relative overflow-hidden">
            <motion.div
              className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-accent/10 blur-3xl"
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center max-w-3xl mx-auto"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                  Ready to Accelerate Your <span className="text-accent">Career?</span>
                </h2>
                <p className="text-xl text-primary-foreground/80 mb-10">
                  Book your first mentorship session today and take the first step towards your dream career.
                </p>
                <Button variant="hero" size="xl" className="animate-pulse-glow">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Free Consultation
                </Button>
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Session with {selectedMentor ? getFullName(selectedMentor) : "Mentor"}</DialogTitle>
            <DialogDescription>
              Session fee: <strong>GHS {(Number(selectedMentor?.session_price) || 0).toFixed(2)}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>First Name <span className="text-red-600">*</span></Label>
                <Input
                  value={formData.first_name}
                  disabled={!!currentUser?.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                  className={currentUser?.first_name ? "bg-secondary/50 cursor-not-allowed" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label>Last Name (Surname) <span className="text-red-600">*</span></Label>
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
              <Label>Email <span className="text-red-600">*</span></Label>
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
              <Label>Phone Number <span className="text-red-600">*</span></Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+233 24 123 4567"
              />
            </div>

            <div className="grid gap-2">
              <Label>Date of Birth <span className="text-red-600">*</span></Label>
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
              <Label>Institution <span className="text-red-600">*</span></Label>
              <Input
                value={formData.student_institution}
                onChange={(e) => setFormData({ ...formData, student_institution: e.target.value })}
                placeholder="University of Ghana / Ashesi University / ..."
              />
            </div>

            <div className="grid gap-2">
              <Label>Programme / Course <span className="text-red-600">*</span></Label>
              <Input
                value={formData.student_course}
                onChange={(e) => setFormData({ ...formData, student_course: e.target.value })}
                placeholder="BSc Computer Science"
              />
            </div>

            <div className="grid gap-2">
              <Label>Level / Year <span className="text-red-600">*</span></Label>
              <Input
                value={formData.student_level}
                onChange={(e) => setFormData({ ...formData, student_level: e.target.value })}
                placeholder="Level 300 / 3rd Year / Masters Year 1"
              />
            </div>

            <div className="grid gap-2">
              <Label>What would you like to discuss? <span className="text-red-600">*</span></Label>
              <Textarea
                value={formData.topic_description}
                onChange={(e) => setFormData({ ...formData, topic_description: e.target.value })}
                placeholder="e.g. Career switch to data analysis, CV review for tech roles, preparing for software engineering interviews, how to negotiate salary, etc."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-2">
              <Label>Preferred Date <span className="text-red-600">*</span></Label>
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => {
                    if (date) {
                      const dateStr = date.toISOString().split("T")[0];
                      setSelectedDate(date);
                      setFormData({ ...formData, scheduled_at: "" });

                      if (selectedMentor) {
                        api
                          .get(`/api/mentors/${selectedMentor.uuid}/available-slots?date=${dateStr}`)
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
            <Button variant="outline" onClick={() => setBookingOpen(false)}>
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

      {/* Bio Dialog */}
      <Dialog open={bioOpen} onOpenChange={setBioOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="relative pb-4">
            <DialogTitle className="pr-10 text-2xl">
              {selectedBioMentor ? getFullName(selectedBioMentor) : "Mentor"} - Full Bio
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-2 top-2">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </DialogHeader>
          <div className="mt-2 text-muted-foreground leading-relaxed whitespace-pre-wrap text-base">
            {selectedBioMentor?.bio || "No detailed bio available for this mentor."}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Mentorship;