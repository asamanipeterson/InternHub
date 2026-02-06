'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Building,
  Users,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  BarChart3,
  UserCircle,
  Upload,
  ImageIcon,
  User,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Download,
  Calendar as CalendarIcon,
  Mail,
  Video,
  Search as SearchIcon,
  Shield,
  Loader2,
  BarChart,
  Star,
  Award,
  X,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

interface Company {
  id: string;
  name: string;
  logo: string | null;
  industry: string;
  description: string | null;
  location: string | null;
  total_slots: number;
  available_slots: number;
  is_paid: boolean;
  requirements: string | null;
  applications_open: boolean;
}

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
  google_calendar_email?: string | null;
  user: {
    id: string;
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    email: string;
  };
}

interface Booking {
  id: string;
  company: { id: string; name: string };
  student_name: string;
  student_email: string;
  student_phone: string;
  student_id: string;
  university: string;
  cv_path: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'expired';
  created_at: string;
  expires_at?: string | null;
}

interface MentorBooking {
  id: string;
  student_name: string;
  student_email: string;
  mentor_name: string;
  mentor_title: string;
  scheduled_at: string;
  amount: number;
  status: string;
  google_meet_link?: string;
  created_at: string;
}

interface GroupedBooking {
  industry: string;
  count: number;
  pending: number;
  bookings: Booking[];
}

interface IndustryAdmin {
  id: string;
  name: string;
  email: string;
  industries: string[];
}

const ITEMS_PER_PAGE = 10;
const REFRESH_INTERVAL = 25000;
const INDUSTRIES_PER_LOAD = 6;
const INDUSTRIES = [
  "Technology", "Finance", "Energy", "HealthCare", "Arts & Design", "Education", "Manufacturing",
  "Telecommunications", "Real Estate", "Agriculture", "Retail & E-commerce", "Transportation",
  "Legal Services", "Marketing & Media", "Hospitality & Tourism", "Construction", "Media & Entertainment",
  "Insurance", "Pharmaceuticals", "Automotive", "Aerospace", "Defense", "Environmental Services",
  "Non-Profit & NGO", "Government & Public Sector", "Consulting", "Human Resources", "Logistics & Supply Chain",
  "Fashion & Apparel", "Food & Beverage", "Sports & Fitness", "Gaming", "Biotechnology", "Renewable Energy",
  "Cybersecurity", "Artificial Intelligence", "Data Science & Analytics", "Cloud Computing", "Blockchain & Crypto"
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [allGroupedBookings, setAllGroupedBookings] = useState<GroupedBooking[]>([]);
  const [visibleGroupedBookings, setVisibleGroupedBookings] = useState<GroupedBooking[]>([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [mentorBookings, setMentorBookings] = useState<MentorBooking[]>([]);
  const [industryAdmins, setIndustryAdmins] = useState<IndustryAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [forcedLoading, setForcedLoading] = useState(true); // minimum 2 seconds loader
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyFile, setCompanyFile] = useState<File | null>(null);
  const [companyPreview, setCompanyPreview] = useState<string | null>(null);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    industry: "",
    description: "",
    location: "",
    total_slots: 5,
    available_slots: 5,
    is_paid: true,
    requirements: "",
  });
  const [mentorDialogOpen, setMentorDialogOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [mentorFile, setMentorFile] = useState<File | null>(null);
  const [mentorPreview, setMentorPreview] = useState<string | null>(null);
  const [mentorForm, setMentorForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    title: "",
    specialization: "",
    bio: "",
    experience: 5,
    rating: 4.5,
    session_price: 200.00,
    google_calendar_email: "",
  });
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [selectedMentorForAvailability, setSelectedMentorForAvailability] = useState<Mentor | null>(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    selectedDays: [] as number[],
    start_time: "09:00",
    end_time: "17:00"
  });
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [currentCvPath, setCurrentCvPath] = useState<string | null>(null);
  const [currentStudentName, setCurrentStudentName] = useState<string>("");
  const [currentCompanyName, setCurrentCompanyName] = useState<string>("");
  const [bioOpen, setBioOpen] = useState(false);
  const [selectedBioMentor, setSelectedBioMentor] = useState<Mentor | null>(null);
  const [industrySearch, setIndustrySearch] = useState("");
  const [visibleIndustryCount, setVisibleIndustryCount] = useState(INDUSTRIES_PER_LOAD);
  const [visibleCompanies, setVisibleCompanies] = useState(ITEMS_PER_PAGE);
  const [visibleMentors, setVisibleMentors] = useState(ITEMS_PER_PAGE);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [adminForm, setAdminForm] = useState({
    email: "",
    industries: [] as string[],
  });

  const getCvUrl = (path: string) => `${api.defaults.baseURL}/storage/${path}`;
  const companyFileInputRef = useRef<HTMLInputElement>(null);
  const mentorFileInputRef = useRef<HTMLInputElement>(null);

  const totalSlots = companies.reduce((acc, c) => acc + (c.total_slots || 0), 0);
  const availableSlotsTotal = companies.reduce((acc, c) => acc + (c.available_slots || 0), 0);
  const bookedSlots = totalSlots - availableSlotsTotal;
  const pendingInternshipBookings = allGroupedBookings.reduce((acc, group) => acc + (group.pending || 0), 0);
  const bookedMentorships = mentorBookings.length;

  const stats = [
    { icon: Building, label: "Companies", value: companies.length, color: "bg-primary", clickable: false },
    { icon: BarChart3, label: "Total Slots", value: totalSlots, color: "bg-accent", clickable: false },
    { icon: CheckCircle, label: "Booked Slots", value: bookedSlots, color: "bg-blue-500", clickable: true, onClick: () => navigate("/booked-slots") },
    { icon: Clock, label: "Pending Internships", value: pendingInternshipBookings, color: "bg-yellow-500", clickable: true, onClick: () => navigate("/pending-applications") },
    { icon: Users, label: "Available Slots", value: availableSlotsTotal, color: "bg-green-500", clickable: false },
    { icon: UserCircle, label: "Mentors", value: mentors.length, color: "bg-muted-foreground", clickable: false },
    { icon: CalendarIcon, label: "Booked Mentorships", value: bookedMentorships, color: "bg-purple-500", clickable: true, onClick: () => navigate("/admin/mentorship-bookings") },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/user");
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };

    const fetchData = async () => {
      const minimumDelay = new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const [companiesRes, mentorsRes, bookingsRes, mentorBookingsRes, adminsRes] = await Promise.all([
          api.get("/api/companies"),
          api.get("/api/mentors"),
          api.get("/api/admin/bookings"),
          api.get("/api/admin/mentor-bookings"),
          api.get("/api/admin/industry-admins"),
        ]);

        await Promise.all([minimumDelay, Promise.resolve()]);

        setCompanies(companiesRes.data || []);
        setMentors(mentorsRes.data || []);
        setAllGroupedBookings(bookingsRes.data || []);
        setMentorBookings(mentorBookingsRes.data || []);
        setIndustryAdmins(adminsRes.data || []);

        setVisibleIndustryCount(INDUSTRIES_PER_LOAD);
        setVisibleCompanies(ITEMS_PER_PAGE);
        setVisibleMentors(ITEMS_PER_PAGE);
      } catch (err: any) {
        toast.error("Failed to load dashboard data");
        console.error("Dashboard fetch error:", err);
        await minimumDelay;
      } finally {
        setLoading(false);
        setForcedLoading(false);
      }
    };

    fetchUser();
    fetchData();

    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (allGroupedBookings.length === 0) {
      setVisibleGroupedBookings([]);
      setFilteredCount(0);
      return;
    }
    const searchLower = industrySearch.trim().toLowerCase();
    let filtered = allGroupedBookings;
    if (searchLower) {
      filtered = allGroupedBookings.filter(group =>
        group.industry.toLowerCase().includes(searchLower)
      );
    }
    setFilteredCount(filtered.length);
    setVisibleGroupedBookings(filtered.slice(0, visibleIndustryCount));
  }, [allGroupedBookings, industrySearch, visibleIndustryCount]);

  const loadMoreIndustries = () => {
    setVisibleIndustryCount(prev => prev + INDUSTRIES_PER_LOAD);
  };

  const refreshData = async () => {
    try {
      const [companiesRes, mentorsRes, bookingsRes, mentorBookingsRes, adminsRes] = await Promise.all([
        api.get("/api/companies"),
        api.get("/api/mentors"),
        api.get("/api/admin/bookings"),
        api.get("/api/admin/mentor-bookings"),
        api.get("/api/admin/industry-admins"),
      ]);
      setCompanies(companiesRes.data || []);
      setMentors(mentorsRes.data || []);
      setAllGroupedBookings(bookingsRes.data || []);
      setMentorBookings(mentorBookingsRes.data || []);
      setIndustryAdmins(adminsRes.data || []);
    } catch (err: any) {
      toast.error("Failed to refresh data");
      console.error("Refresh error:", err);
    }
  };

  const openAvailabilityDialog = (mentor: Mentor) => {
    setSelectedMentorForAvailability(mentor);
    setAvailabilityForm({
      selectedDays: [],
      start_time: "09:00",
      end_time: "17:00"
    });
    setAvailabilityDialogOpen(true);
  };

  const openBioDialog = (mentor: Mentor) => {
    setSelectedBioMentor(mentor);
    setBioOpen(true);
  };

  const handleSaveAvailability = async () => {
    if (!selectedMentorForAvailability) return;
    if (availabilityForm.selectedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }
    setSavingAvailability(true);
    try {
      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const promises = availabilityForm.selectedDays.map(dayIndex =>
        api.post(`/api/mentors/${selectedMentorForAvailability.uuid}/availabilities`, {
          day_of_week: dayNames[dayIndex - 1],
          start_time: availabilityForm.start_time,
          end_time: availabilityForm.end_time,
        })
      );
      await Promise.all(promises);
      toast.success(`Availability saved for ${availabilityForm.selectedDays.length} day(s)`);
      setAvailabilityDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save availability");
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleToggleApplications = async (company: Company, open: boolean) => {
    try {
      const response = await api.post(`/api/companies/${company.id}/toggle-applications`, { open });
      toast.success(response.data.message);
      await refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update application status");
    }
  };

  const handleCompanyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompanyFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCompanyPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMentorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMentorFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setMentorPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCompany = async () => {
    if (!companyForm.name || !companyForm.industry) {
      toast.error("Please fill in required fields");
      return;
    }
    const formData = new FormData();
    formData.append("name", companyForm.name);
    formData.append("industry", companyForm.industry);
    formData.append("description", companyForm.description || "");
    formData.append("location", companyForm.location || "");
    formData.append("total_slots", companyForm.total_slots.toString());
    formData.append("available_slots", companyForm.available_slots.toString());
    formData.append("is_paid", companyForm.is_paid ? "1" : "0");
    formData.append("requirements", companyForm.requirements || "");
    if (companyFile) formData.append("logo", companyFile);
    try {
      if (editingCompany) {
        await api.post(`/api/companies/${editingCompany.id}?_method=PUT`, formData);
        toast.success("Company updated successfully");
      } else {
        await api.post("/api/companies", formData);
        toast.success("Company added successfully");
      }
      setCompanyDialogOpen(false);
      setEditingCompany(null);
      setCompanyForm({
        name: "",
        industry: "",
        description: "",
        location: "",
        total_slots: 5,
        available_slots: 5,
        is_paid: true,
        requirements: "",
      });
      setCompanyFile(null);
      setCompanyPreview(null);
      await refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error saving company");
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name,
      industry: company.industry,
      description: company.description || "",
      location: company.location || "",
      total_slots: company.total_slots,
      available_slots: company.available_slots,
      is_paid: company.is_paid ?? true,
      requirements: company.requirements || "",
    });
    setCompanyPreview(company.logo ? `/${company.logo}` : null);
    setCompanyFile(null);
    setCompanyDialogOpen(true);
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    try {
      await api.delete(`/api/companies/${id}`);
      toast.success("Company deleted successfully");
      await refreshData();
    } catch (err) {
      toast.error("Failed to delete company");
    }
  };

  const handleSaveMentor = async () => {
    if (!mentorForm.first_name || !mentorForm.last_name || !mentorForm.email || !mentorForm.title || !mentorForm.session_price) {
      toast.error("Please fill in all required fields: first name, last name, email, title, session price");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mentorForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    const formData = new FormData();
    formData.append("first_name", mentorForm.first_name.trim());
    formData.append("middle_name", mentorForm.middle_name?.trim() || "");
    formData.append("last_name", mentorForm.last_name.trim());
    formData.append("email", mentorForm.email.trim());
    formData.append("title", mentorForm.title.trim());
    formData.append("specialization", mentorForm.specialization?.trim() || "");
    formData.append("bio", mentorForm.bio?.trim() || "");
    formData.append("experience", mentorForm.experience.toString());
    formData.append("rating", mentorForm.rating.toString());
    formData.append("session_price", mentorForm.session_price.toString());
    formData.append("google_calendar_email", mentorForm.google_calendar_email?.trim() || "");
    if (mentorFile) formData.append("image", mentorFile);
    try {
      if (editingMentor) {
        await api.post(`/api/mentors/${editingMentor.uuid}?_method=PUT`, formData);
        toast.success("Mentor updated successfully");
      } else {
        await api.post("/api/mentors", formData);
        toast.success("Mentor added successfully – welcome email sent!");
      }
      setMentorDialogOpen(false);
      setEditingMentor(null);
      setMentorForm({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        title: "",
        specialization: "",
        bio: "",
        experience: 5,
        rating: 4.5,
        session_price: 200.00,
        google_calendar_email: "",
      });
      setMentorFile(null);
      setMentorPreview(null);
      await refreshData();
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.errors?.email) {
        const msg = errorData.errors.email[0];
        toast.error(msg.includes("taken") ? "Email already in use." : msg);
      } else {
        toast.error(errorData?.message || "Failed to save mentor.");
      }
    }
  };

  const handleEditMentor = (mentor: Mentor) => {
    setEditingMentor(mentor);
    setMentorForm({
      first_name: mentor.user?.first_name || "",
      middle_name: mentor.user?.middle_name || "",
      last_name: mentor.user?.last_name || "",
      email: mentor.user?.email || "",
      title: mentor.title,
      specialization: mentor.specialization || "",
      bio: mentor.bio || "",
      experience: mentor.experience,
      rating: Number(mentor.rating),
      session_price: Number(mentor.session_price) || 200.00,
      google_calendar_email: mentor.google_calendar_email || "",
    });
    setMentorPreview(mentor.image ? `/${mentor.image}` : null);
    setMentorFile(null);
    setMentorDialogOpen(true);
  };

  const handleDeleteMentor = async (uuid: string) => {
    if (!confirm("Are you sure you want to delete this mentor?")) return;
    try {
      await api.delete(`/api/mentors/${uuid}`);
      toast.success("Mentor deleted successfully");
      await refreshData();
    } catch (err) {
      toast.error("Failed to delete mentor");
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    const booking = allGroupedBookings.flatMap(g => g.bookings).find(b => b.id === bookingId);
    if (!booking) return;
    const confirmed = confirm(
      `Approve ${booking.student_name}'s application?\n\nA payment link will be sent to ${booking.student_email}.`
    );
    if (!confirmed) return;
    try {
      await api.post(`/api/admin/bookings/${bookingId}/approve`);
      toast.success("Application approved!");
      await refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve application");
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    const booking = allGroupedBookings.flatMap(g => g.bookings).find(b => b.id === bookingId);
    if (!booking) return;
    const reason = prompt("Please provide a reason for rejection (sent to student):", "");
    if (!reason || reason.trim().length < 10) {
      toast.error("Rejection reason must be at least 10 characters.");
      return;
    }
    try {
      await api.post(`/api/admin/bookings/${bookingId}/reject`, { reason: reason.trim() });
      toast.success("Application rejected.");
      await refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject application");
    }
  };

  const handleCreateIndustryAdmin = async () => {
    if (!adminForm.email || adminForm.industries.length === 0) {
      toast.error("Email and at least one industry are required");
      return;
    }
    try {
      await api.post("/api/admin/industry-admins", {
        email: adminForm.email,
        industries: adminForm.industries,
      });
      toast.success("Industry admin created — set-password email sent");
      setAdminDialogOpen(false);
      setAdminForm({ email: "", industries: [] });
      const adminsRes = await api.get("/api/admin/industry-admins");
      setIndustryAdmins(adminsRes.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create industry admin");
    }
  };

  const handleUpdateIndustryAdmin = async () => {
    if (!editingAdminId || adminForm.industries.length === 0) {
      toast.error("No admin selected or no industries assigned");
      return;
    }
    try {
      await api.put(`/api/admin/industry-admins/${editingAdminId}`, {
        industries: adminForm.industries,
      });
      toast.success("Industry assignments updated successfully");
      setAdminDialogOpen(false);
      setEditingAdminId(null);
      setAdminForm({ email: "", industries: [] });
      const adminsRes = await api.get("/api/admin/industry-admins");
      setIndustryAdmins(adminsRes.data || []);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update assignments";
      toast.error(msg);
    }
  };

  const openCvModal = (booking: Booking) => {
    setCurrentCvPath(booking.cv_path);
    setCurrentStudentName(booking.student_name);
    setCurrentCompanyName(booking.company.name);
    setCvModalOpen(true);
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-lg text-primary-foreground/80">Loading available internships...</p>
      </div>
    </div>
  );
}

 

  const isSuperAdmin = currentUser?.user_type === 'admin';
  const displayedCompanies = companies.slice(0, visibleCompanies);
  const displayedMentors = mentors.slice(0, visibleMentors);
  const hasMoreCompanies = visibleCompanies < companies.length;
  const hasMoreMentors = visibleMentors < mentors.length;

  const loadMoreCompanies = () => setVisibleCompanies(prev => prev + ITEMS_PER_PAGE);
  const loadMoreMentors = () => setVisibleMentors(prev => prev + ITEMS_PER_PAGE);

  const getFullName = (mentor: Mentor) => {
    const parts = [
      mentor.user?.first_name || "",
      mentor.user?.middle_name || "",
      mentor.user?.last_name || ""
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Mentor Name";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 lg:pt-40 pb-8 gradient-hero">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-primary-foreground/80">
                Manage companies, mentors, internship applications {isSuperAdmin && "and industry admins"}
              </p>
            </motion.div>
            <Button
              variant="default"
              size="lg"
              onClick={() => navigate("/admin/analyticspage")}
              className="gap-2 whitespace-nowrap"
            >
              <BarChart className="h-5 w-5" />
              View Analytics
            </Button>
          </div>
        </div>
      </section>
      <section className="py-8 -mt-8">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className={`bg-card rounded-xl p-6 shadow-elevated border border-border text-center transition-all ${
                  stat.clickable ? "cursor-pointer hover:shadow-xl" : ""
                }`}
                onClick={stat.clickable ? stat.onClick : undefined}
              >
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <Tabs defaultValue="companies" className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-5 mx-auto">
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building className="h-4 w-4" /> Companies
              </TabsTrigger>
              <TabsTrigger value="mentors" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Mentors
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Intern Booking
              </TabsTrigger>
              <TabsTrigger value="availability" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Availability
              </TabsTrigger>
              {isSuperAdmin && (
                <TabsTrigger value="admins" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Intern Admins
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="companies" className="space-y-8">
              <motion.div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Manage Companies</h2>
                <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="accent" onClick={() => {
                      setEditingCompany(null);
                      setCompanyForm({
                        name: "",
                        industry: "",
                        description: "",
                        location: "",
                        total_slots: 5,
                        available_slots: 5,
                        is_paid: true,
                        requirements: "",
                      });
                      setCompanyFile(null);
                      setCompanyPreview(null);
                    }}>
                      <Plus className="h-4 w-4 mr-2" /> Add Company
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingCompany ? "Edit Company" : "Add New Company"}</DialogTitle>
                      <DialogDescription>Fill in the company details below</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                          <Label>Company Name *</Label>
                          <Input
                            placeholder="Enter name"
                            value={companyForm.name}
                            onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <Label>Industry *</Label>
                          <Select
                            value={companyForm.industry}
                            onValueChange={(val) => setCompanyForm({ ...companyForm, industry: val })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {INDUSTRIES.map((ind) => (
                                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Paid Internship? *</Label>
                        <select
                          value={companyForm.is_paid ? "yes" : "no"}
                          onChange={(e) => setCompanyForm({ ...companyForm, is_paid: e.target.value === "yes" })}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="yes">Yes – Paid internship</option>
                          <option value="no">No – Unpaid / Volunteer</option>
                        </select>
                      </div>
                      <div>
                        <Label>Internship Requirements</Label>
                        <Textarea
                          placeholder="One requirement per line (will be shown as numbered list)\nExample:\nPursuing Computer Science degree\nKnowledge of React\nGood communication skills"
                          value={companyForm.requirements}
                          onChange={(e) => setCompanyForm({ ...companyForm, requirements: e.target.value })}
                          rows={4}
                        />
                        <p className="text-xs text-muted-foreground mt-1">One per line</p>
                      </div>
                      <div>
                        <Label>Company Logo</Label>
                        <div className="mt-2 flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-secondary/30 cursor-pointer"
                            onClick={() => companyFileInputRef.current?.click()}
                          >
                            {companyPreview ? (
                              <img src={companyPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="text-muted-foreground w-6 h-6" />
                            )}
                          </div>
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              ref={companyFileInputRef}
                              className="hidden"
                              onChange={handleCompanyImageChange}
                            />
                            <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => companyFileInputRef.current?.click()}>
                              <Upload className="h-4 w-4 mr-2" /> Upload Logo
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          placeholder="e.g. Accra, Ghana"
                          value={companyForm.location}
                          onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Briefly describe the company..."
                          value={companyForm.description}
                          onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Total Slots</Label>
                          <Input
                            type="number"
                            value={companyForm.total_slots}
                            onChange={(e) => setCompanyForm({ ...companyForm, total_slots: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Available Slots</Label>
                          <Input
                            type="number"
                            value={companyForm.available_slots}
                            onChange={(e) => setCompanyForm({ ...companyForm, available_slots: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <Button variant="accent" className="w-full" onClick={handleSaveCompany}>
                        {editingCompany ? "Update Company" : "Add Company"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
              <div className="bg-card rounded-xl shadow-elevated overflow-hidden border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-4 font-medium">Company</th>
                        <th className="text-left p-4 font-medium hidden md:table-cell">Industry</th>
                        <th className="text-left p-4 font-medium hidden md:table-cell">Location</th>
                        <th className="text-center p-4 font-medium">Slots</th>
                        <th className="text-center p-4 font-medium">Applications Open</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedCompanies.map((company, index) => (
                        <motion.tr
                          key={company.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-t border-border hover:bg-secondary/50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {company.logo ? (
                                <img
                                  src={`/${company.logo}`}
                                  alt={company.name}
                                  className="w-8 h-8 rounded object-cover border border-border"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-xs">Building</div>
                              )}
                              <span className="font-medium">{company.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground hidden md:table-cell">{company.industry}</td>
                          <td className="p-4 text-muted-foreground hidden md:table-cell">{company.location || "-"}</td>
                          <td className="p-4 text-center">
                            <span className="text-accent font-semibold">{company.available_slots}</span>/{company.total_slots}
                          </td>
                          <td className="p-4 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={company.applications_open}
                                onChange={(e) => handleToggleApplications(company, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className={`w-11 h-6 rounded-full transition-colors ${company.applications_open ? 'bg-green-500' : 'bg-gray-400'}`}>
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${company.applications_open ? 'translate-x-5' : 'translate-x-0'}`}></div>
                              </div>
                            </label>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditCompany(company)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteCompany(company.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {hasMoreCompanies && (
                <div className="text-center mt-8">
                  <Button variant="accent" size="lg" onClick={loadMoreCompanies}>
                    Load More Companies
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mentors" className="space-y-8">
              <motion.div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Manage Mentors</h2>
                <Dialog open={mentorDialogOpen} onOpenChange={setMentorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="accent" onClick={() => {
                      setEditingMentor(null);
                      setMentorForm({
                        first_name: "",
                        middle_name: "",
                        last_name: "",
                        email: "",
                        title: "",
                        specialization: "",
                        bio: "",
                        experience: 5,
                        rating: 4.5,
                        session_price: 200.00,
                        google_calendar_email: "",
                      });
                      setMentorFile(null);
                      setMentorPreview(null);
                    }}>
                      <Plus className="h-4 w-4 mr-2" /> Add Mentor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingMentor ? "Edit Mentor" : "Add New Mentor"}</DialogTitle>
                      <DialogDescription>Fill in the mentor details below</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="flex flex-col items-center mb-4">
                        <div
                          className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-secondary/30 cursor-pointer mb-2"
                          onClick={() => mentorFileInputRef.current?.click()}
                        >
                          {mentorPreview ? (
                            <img src={mentorPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="text-muted-foreground w-10 h-10" />
                          )}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          ref={mentorFileInputRef}
                          className="hidden"
                          onChange={handleMentorImageChange}
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => mentorFileInputRef.current?.click()}>
                          Change Photo
                        </Button>
                      </div>
                      <div>
                        <Label>Email Address (login & notifications) *</Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="mentor@example.com"
                            value={mentorForm.email}
                            onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value.trim() })}
                            className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>First Name *</Label>
                          <Input
                            placeholder="First"
                            value={mentorForm.first_name}
                            onChange={(e) => setMentorForm({ ...mentorForm, first_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Middle Name</Label>
                          <Input
                            placeholder="Middle (optional)"
                            value={mentorForm.middle_name}
                            onChange={(e) => setMentorForm({ ...mentorForm, middle_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Last Name *</Label>
                          <Input
                            placeholder="Last"
                            value={mentorForm.last_name}
                            onChange={(e) => setMentorForm({ ...mentorForm, last_name: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Job Title *</Label>
                          <Input
                            placeholder="e.g. Senior Software Engineer"
                            value={mentorForm.title}
                            onChange={(e) => setMentorForm({ ...mentorForm, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Specialization</Label>
                          <Input
                            placeholder="e.g. Frontend, DevOps, Data Science"
                            value={mentorForm.specialization}
                            onChange={(e) => setMentorForm({ ...mentorForm, specialization: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Bio</Label>
                        <Textarea
                          placeholder="Professional background, expertise, achievements..."
                          value={mentorForm.bio}
                          onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Experience (years) *</Label>
                          <Input
                            type="number"
                            min="0"
                            value={mentorForm.experience}
                            onChange={(e) => setMentorForm({ ...mentorForm, experience: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Rating (0-5)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={mentorForm.rating}
                            onChange={(e) => setMentorForm({ ...mentorForm, rating: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Session Price (GHS) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={mentorForm.session_price}
                            onChange={(e) => setMentorForm({ ...mentorForm, session_price: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Google Calendar Email (for auto Meet links)</Label>
                        <Input
                          type="email"
                          placeholder="mentor@gmail.com"
                          value={mentorForm.google_calendar_email}
                          onChange={(e) => setMentorForm({ ...mentorForm, google_calendar_email: e.target.value })}
                        />
                      </div>
                      <Button variant="accent" className="w-full mt-6" onClick={handleSaveMentor}>
                        {editingMentor ? "Update Mentor" : "Add Mentor"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedMentors.map((mentor, index) => {
                  const fullName = getFullName(mentor);
                  const bioText = mentor.bio || "Dedicated mentor committed to your career success.";
                  const isLongBio = bioText.length > 30;
                  const truncatedBio = isLongBio ? bioText.substring(0, 30) + "..." : bioText;
                  return (
                    <motion.div
                      key={mentor.id}
                      variants={itemVariants}
                      whileHover={{ y: -10, scale: 1.02 }}
                      className="group"
                    >
                      <div className="bg-card rounded-3xl overflow-hidden shadow-elegant hover:shadow-elevated transition-all duration-500 border border-border/50 cursor-pointer">
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
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                                  {fullName}
                                </h3>
                                <p className="text-accent font-semibold">{mentor.title}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEditMentor(mentor)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteMentor(mentor.uuid)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
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
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
              {hasMoreMentors && (
                <div className="text-center mt-8">
                  <Button variant="accent" size="lg" onClick={loadMoreMentors}>
                    Load More Mentors
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookings" className="space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold">Internship Applications by Industry</h2>
                <div className="relative w-full md:w-80">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search industries..."
                    value={industrySearch}
                    onChange={(e) => {
                      setIndustrySearch(e.target.value);
                      setVisibleIndustryCount(INDUSTRIES_PER_LOAD);
                    }}
                    className="pl-10"
                  />
                </div>
              </motion.div>
              {visibleGroupedBookings.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {industrySearch ? "No matching industries" : "No applications yet"}
                  </h3>
                  <p className="text-muted-foreground">
                    {industrySearch ? "Try a different search term" : "Applications will appear here when students apply"}
                  </p>
                </motion.div>
              ) : (
                <>
                  {visibleGroupedBookings.map((group) => (
                    <div key={group.industry} className="mb-12">
                      <div className="flex items-center justify-between mb-4 bg-secondary/50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold">{group.industry}</h3>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{group.count}</span> total •
                          <span className="ml-1 text-yellow-600 font-medium">{group.pending}</span> pending
                        </div>
                      </div>
                      <div className="bg-card rounded-xl shadow-soft border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-max">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left p-4 font-medium">Student</th>
                                <th className="text-left p-4 font-medium">Company</th>
                                <th className="text-left p-4 font-medium hidden md:table-cell">Email</th>
                                <th className="text-left p-4 font-medium hidden lg:table-cell">Applied</th>
                                <th className="text-center p-4 font-medium">Status</th>
                                <th className="text-center p-4 font-medium">CV</th>
                                <th className="text-right p-4 font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.bookings.map((booking, idx) => (
                                <motion.tr
                                  key={booking.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.03 }}
                                  className="border-t border-border hover:bg-muted/30 transition-colors"
                                >
                                  <td className="p-4">
                                    <div>
                                      <span className="font-medium">{booking.student_name}</span>
                                      <p className="text-sm text-muted-foreground">{booking.university}</p>
                                    </div>
                                  </td>
                                  <td className="p-4">{booking.company.name}</td>
                                  <td className="p-4 hidden md:table-cell">{booking.student_email}</td>
                                  <td className="p-4 hidden lg:table-cell">
                                    {new Date(booking.created_at).toLocaleDateString()}
                                  </td>
                                  <td className="p-4 text-center">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        booking.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                        booking.status === 'paid' ? 'bg-green-100 text-green-800' :
                                        booking.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <Button variant="ghost" size="sm" onClick={() => openCvModal(booking)}>
                                      <FileText className="h-4 w-4 mr-2" /> View CV
                                    </Button>
                                  </td>
                                  <td className="p-4 text-right">
                                    {booking.status === 'pending' && (
                                      <div className="flex items-center justify-end gap-2">
                                        <Button variant="default" size="sm" onClick={() => handleApproveBooking(booking.id)}>
                                          <CheckCircle className="h-4 w-4 mr-2" /> Approve
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleRejectBooking(booking.id)}>
                                          <XCircle className="h-4 w-4 mr-2" /> Reject
                                        </Button>
                                      </div>
                                    )}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                  {visibleIndustryCount < filteredCount && (
                    <div className="text-center mt-12">
                      <Button variant="accent" size="lg" onClick={loadMoreIndustries} className="px-10">
                        Load More Bookings
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="availability" className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Mentor Weekly Availability</h2>
                  <p className="text-sm text-muted-foreground">
                    Set recurring availability slots for mentors
                  </p>
                </div>
                {mentors.length === 0 ? (
                  <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No mentors yet</h3>
                    <p className="text-muted-foreground">
                      Add mentors first to set their availability
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {mentors.map((mentor) => (
                      <motion.div
                        key={mentor.uuid}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card p-6 rounded-xl border border-border shadow-soft"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            {mentor.image ? (
                              <img
                                src={`/${mentor.image}`}
                                alt={`${mentor.user?.first_name || ""} ${mentor.user?.last_name || ""}`}
                                className="w-12 h-12 rounded-full object-cover border"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <User className="h-6 w-6 text-accent" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold">
                                {mentor.user?.first_name || ""}{" "}
                                {mentor.user?.middle_name ? mentor.user.middle_name + " " : ""}
                                {mentor.user?.last_name || "Mentor"}
                              </h3>
                              <p className="text-sm text-muted-foreground">{mentor.title}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAvailabilityDialog(mentor)}
                          >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Set Schedule
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          No schedule configured yet
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {isSuperAdmin && (
              <TabsContent value="admins" className="space-y-8">
                <motion.div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Manage Intern Admins</h2>
                  <Button variant="accent" onClick={() => {
                    setEditingAdminId(null);
                    setAdminForm({ email: "", industries: [] });
                    setAdminDialogOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" /> Create Intern Admin
                  </Button>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {industryAdmins.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-muted/30 rounded-xl border border-border">
                      <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No intern admins yet</h3>
                      <p className="text-muted-foreground">
                        Create one using the button above.
                      </p>
                    </div>
                  ) : (
                    industryAdmins.map((admin) => (
                      <div
                        key={admin.id}
                        className="bg-card rounded-xl p-6 border border-border shadow-soft hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {admin.name || admin.email.split('@')[0]}
                            </h3>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                          </div>
                          <Shield className="h-5 w-5 text-primary mt-1" />
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {admin.industries.length === 0 ? (
                            <span className="text-sm text-muted-foreground italic">
                              No industries assigned
                            </span>
                          ) : (
                            admin.industries.map((ind) => (
                              <Badge key={ind} variant="outline" className="bg-secondary">
                                {ind}
                              </Badge>
                            ))
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setAdminForm({
                              email: admin.email,
                              industries: admin.industries,
                            });
                            setEditingAdminId(admin.id);
                            setAdminDialogOpen(true);
                          }}
                        >
                          Edit Assignments
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <Dialog open={adminDialogOpen} onOpenChange={(open) => {
                  setAdminDialogOpen(open);
                  if (!open) {
                    setAdminForm({ email: "", industries: [] });
                    setEditingAdminId(null);
                  }
                }}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAdminId ? "Edit Industry Admin" : "Create Intern Admin"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingAdminId
                          ? "Update assigned industries. An industry can only belong to one admin."
                          : "Enter email and assign industries. A set-password email will be sent."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {!editingAdminId && (
                        <div>
                          <Label>Email Address *</Label>
                          <Input
                            type="email"
                            placeholder="admin@example.com"
                            value={adminForm.email}
                            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                            disabled={!!editingAdminId}
                          />
                        </div>
                      )}
                      <div>
                        <Label>Assigned Industries *</Label>
                        <Select
                          onValueChange={(val) => {
                            if (!adminForm.industries.includes(val)) {
                              setAdminForm(prev => ({
                                ...prev,
                                industries: [...prev.industries, val]
                              }));
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select industries..." />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRIES.filter(ind => !adminForm.industries.includes(ind)).map(ind => (
                              <SelectItem key={ind} value={ind}>
                                {ind}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {adminForm.industries.map(ind => (
                            <div
                              key={ind}
                              className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                              {ind}
                              <button
                                onClick={() => setAdminForm(prev => ({
                                  ...prev,
                                  industries: prev.industries.filter(i => i !== ind)
                                }))}
                                className="text-red-500 hover:text-red-700 text-lg leading-none"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {adminForm.industries.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">
                              No industries selected
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={editingAdminId ? handleUpdateIndustryAdmin : handleCreateIndustryAdmin}
                        disabled={
                          (editingAdminId ? false : !adminForm.email.trim()) ||
                          adminForm.industries.length === 0
                        }
                      >
                        {editingAdminId ? "Update Assignments" : "Create & Send Email"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </section>

      {/* Bio Read More Dialog */}
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

      {/* Company Dialog */}
      <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCompany ? "Edit Company" : "Add New Company"}</DialogTitle>
            <DialogDescription>Fill in the company details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <Label>Company Name *</Label>
                <Input
                  placeholder="Enter name"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <Label>Industry *</Label>
                <Select
                  value={companyForm.industry}
                  onValueChange={(val) => setCompanyForm({ ...companyForm, industry: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Paid Internship? *</Label>
              <select
                value={companyForm.is_paid ? "yes" : "no"}
                onChange={(e) => setCompanyForm({ ...companyForm, is_paid: e.target.value === "yes" })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="yes">Yes – Paid internship</option>
                <option value="no">No – Unpaid / Volunteer</option>
              </select>
            </div>
            <div>
              <Label>Internship Requirements</Label>
              <Textarea
                placeholder="One requirement per line (will be shown as numbered list)\nExample:\nPursuing Computer Science degree\nKnowledge of React\nGood communication skills"
                value={companyForm.requirements}
                onChange={(e) => setCompanyForm({ ...companyForm, requirements: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">One per line</p>
            </div>
            <div>
              <Label>Company Logo</Label>
              <div className="mt-2 flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-secondary/30 cursor-pointer"
                  onClick={() => companyFileInputRef.current?.click()}
                >
                  {companyPreview ? (
                    <img src={companyPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-muted-foreground w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    ref={companyFileInputRef}
                    className="hidden"
                    onChange={handleCompanyImageChange}
                  />
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => companyFileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" /> Upload Logo
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input
                placeholder="e.g. Accra, Ghana"
                value={companyForm.location}
                onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Briefly describe the company..."
                value={companyForm.description}
                onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Slots</Label>
                <Input
                  type="number"
                  value={companyForm.total_slots}
                  onChange={(e) => setCompanyForm({ ...companyForm, total_slots: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Available Slots</Label>
                <Input
                  type="number"
                  value={companyForm.available_slots}
                  onChange={(e) => setCompanyForm({ ...companyForm, available_slots: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <Button variant="accent" className="w-full" onClick={handleSaveCompany}>
              {editingCompany ? "Update Company" : "Add Company"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mentor Dialog */}
      <Dialog open={mentorDialogOpen} onOpenChange={setMentorDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMentor ? "Edit Mentor" : "Add New Mentor"}</DialogTitle>
            <DialogDescription>Fill in the mentor details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col items-center mb-4">
              <div
                className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-secondary/30 cursor-pointer mb-2"
                onClick={() => mentorFileInputRef.current?.click()}
              >
                {mentorPreview ? (
                  <img src={mentorPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-muted-foreground w-10 h-10" />
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                ref={mentorFileInputRef}
                className="hidden"
                onChange={handleMentorImageChange}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => mentorFileInputRef.current?.click()}>
                Change Photo
              </Button>
            </div>
            <div>
              <Label>Email Address (login & notifications) *</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="mentor@example.com"
                  value={mentorForm.email}
                  onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value.trim() })}
                  className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  placeholder="First"
                  value={mentorForm.first_name}
                  onChange={(e) => setMentorForm({ ...mentorForm, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Middle Name</Label>
                <Input
                  placeholder="Middle (optional)"
                  value={mentorForm.middle_name}
                  onChange={(e) => setMentorForm({ ...mentorForm, middle_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  placeholder="Last"
                  value={mentorForm.last_name}
                  onChange={(e) => setMentorForm({ ...mentorForm, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Job Title *</Label>
                <Input
                  placeholder="e.g. Senior Software Engineer"
                  value={mentorForm.title}
                  onChange={(e) => setMentorForm({ ...mentorForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Specialization</Label>
                <Input
                  placeholder="e.g. Frontend, DevOps, Data Science"
                  value={mentorForm.specialization}
                  onChange={(e) => setMentorForm({ ...mentorForm, specialization: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea
                placeholder="Professional background, expertise, achievements..."
                value={mentorForm.bio}
                onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Experience (years) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={mentorForm.experience}
                  onChange={(e) => setMentorForm({ ...mentorForm, experience: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Rating (0-5)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={mentorForm.rating}
                  onChange={(e) => setMentorForm({ ...mentorForm, rating: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Session Price (GHS) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={mentorForm.session_price}
                  onChange={(e) => setMentorForm({ ...mentorForm, session_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label>Google Calendar Email (for auto Meet links)</Label>
              <Input
                type="email"
                placeholder="mentor@gmail.com"
                value={mentorForm.google_calendar_email}
                onChange={(e) => setMentorForm({ ...mentorForm, google_calendar_email: e.target.value })}
              />
            </div>
            <Button variant="accent" className="w-full mt-6" onClick={handleSaveMentor}>
              {editingMentor ? "Update Mentor" : "Add Mentor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Availability Dialog */}
      <Dialog open={availabilityDialogOpen} onOpenChange={setAvailabilityDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Set Availability – {selectedMentorForAvailability?.user?.first_name || ""} {selectedMentorForAvailability?.user?.last_name || "Mentor"}
            </DialogTitle>
            <DialogDescription>
              Define recurring weekly availability slots for this mentor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label className="mb-3 block">Select Days</Label>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                  const dayNum = idx + 1;
                  const isSelected = availabilityForm.selectedDays.includes(dayNum);
                  return (
                    <Button
                      key={day}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="text-xs sm:text-sm"
                      onClick={() => {
                        setAvailabilityForm(prev => ({
                          ...prev,
                          selectedDays: isSelected
                            ? prev.selectedDays.filter(d => d !== dayNum)
                            : [...prev.selectedDays, dayNum]
                        }));
                      }}
                    >
                      {day}
                    </Button>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAvailabilityForm(prev => ({ ...prev, selectedDays: [1,2,3,4,5] }))}
                >
                  Weekdays
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAvailabilityForm(prev => ({ ...prev, selectedDays: [6,7] }))}
                >
                  Weekend
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAvailabilityForm(prev => ({ ...prev, selectedDays: [1,2,3,4,5,6,7] }))}
                >
                  All Week
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAvailabilityForm(prev => ({ ...prev, selectedDays: [] }))}
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={availabilityForm.start_time}
                  onChange={(e) => setAvailabilityForm(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={availabilityForm.end_time}
                  onChange={(e) => setAvailabilityForm(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setAvailabilityDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAvailability}
                disabled={savingAvailability || availabilityForm.selectedDays.length === 0}
              >
                {savingAvailability ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Availability"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CV Modal */}
      <Dialog open={cvModalOpen} onOpenChange={setCvModalOpen}>
        <DialogContent className="max-w-5xl w-full h-[90vh] max-h-screen p-0 flex flex-col">
          <DialogHeader className="p-6 pb-3 flex flex-row items-center justify-between border-b bg-card">
            <div>
              <DialogTitle className="text-xl">CV - {currentStudentName}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">Application for {currentCompanyName}</DialogDescription>
            </div>
            {currentCvPath && (
              <Button variant="outline" size="sm" asChild>
                <a href={getCvUrl(currentCvPath)} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </a>
              </Button>
            )}
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-gray-50">
            {currentCvPath ? (
              <iframe src={getCvUrl(currentCvPath)} className="w-full h-full" title="CV Viewer" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p>No CV uploaded</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Dialog - Create / Edit */}
      <Dialog open={adminDialogOpen} onOpenChange={(open) => {
        setAdminDialogOpen(open);
        if (!open) {
          setAdminForm({ email: "", industries: [] });
          setEditingAdminId(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAdminId ? "Edit Industry Admin" : "Create Intern Admin"}
            </DialogTitle>
            <DialogDescription>
              {editingAdminId
                ? "Update assigned industries. An industry can only belong to one admin."
                : "Enter email and assign industries. A set-password email will be sent."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!editingAdminId && (
              <div>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  disabled={!!editingAdminId}
                />
              </div>
            )}
            <div>
              <Label>Assigned Industries *</Label>
              <Select
                onValueChange={(val) => {
                  if (!adminForm.industries.includes(val)) {
                    setAdminForm(prev => ({
                      ...prev,
                      industries: [...prev.industries, val]
                    }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industries..." />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.filter(ind => !adminForm.industries.includes(ind)).map(ind => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-3 flex flex-wrap gap-2">
                {adminForm.industries.map(ind => (
                  <div
                    key={ind}
                    className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {ind}
                    <button
                      onClick={() => setAdminForm(prev => ({
                        ...prev,
                        industries: prev.industries.filter(i => i !== ind)
                      }))}
                      className="text-red-500 hover:text-red-700 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {adminForm.industries.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No industries selected
                  </p>
                )}
              </div>
            </div>
            <Button
              className="w-full"
              onClick={editingAdminId ? handleUpdateIndustryAdmin : handleCreateIndustryAdmin}
              disabled={
                (editingAdminId ? false : !adminForm.email.trim()) ||
                adminForm.industries.length === 0
              }
            >
              {editingAdminId ? "Update Assignments" : "Create & Send Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Dashboard;