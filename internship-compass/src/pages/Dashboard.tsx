'use client';

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
}

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
  zoom_email?: string | null;
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

// Type for mentorship bookings (adjust fields based on your actual API response)
interface MentorBooking {
  id: string;
  student_name: string;
  student_email: string;
  mentor_name: string;
  mentor_title: string;
  scheduled_at: string;
  amount: number;
  status: string;
  zoom_join_url?: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

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

  // Main data states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]); // Internship/company bookings
  const [mentorBookings, setMentorBookings] = useState<MentorBooking[]>([]); // Only paid mentorship bookings
  const [loading, setLoading] = useState(true);

  // Company dialog states
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
  });

  // Mentor dialog states
  const [mentorDialogOpen, setMentorDialogOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [mentorFile, setMentorFile] = useState<File | null>(null);
  const [mentorPreview, setMentorPreview] = useState<string | null>(null);
  const [mentorForm, setMentorForm] = useState({
    name: "",
    title: "",
    specialization: "",
    bio: "",
    experience: 5,
    rating: 4.5,
    session_price: 200.00,
    zoom_email: "",
  });

  // Availability editor states
  const [selectedMentorForAvailability, setSelectedMentorForAvailability] = useState<Mentor | null>(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    selectedDays: [] as number[], // 1=Mon, 2=Tue, ..., 7=Sun
    start_time: "09:00",
    end_time: "17:00"
  });

  // CV Modal states
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [currentCvPath, setCurrentCvPath] = useState<string | null>(null);
  const [currentStudentName, setCurrentStudentName] = useState<string>("");
  const [currentCompanyName, setCurrentCompanyName] = useState<string>("");

  const getCvUrl = (path: string) => {
    return `${api.defaults.baseURL}/storage/${path}`;
  };

  const [visibleCompanies, setVisibleCompanies] = useState(ITEMS_PER_PAGE);
  const [visibleMentors, setVisibleMentors] = useState(ITEMS_PER_PAGE);

  const companyFileInputRef = useRef<HTMLInputElement>(null);
  const mentorFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, mentorsRes, internshipRes, mentorBookingsRes] = await Promise.all([
          api.get("/api/companies"),
          api.get("/api/mentors"),
          api.get("/api/admin/bookings"),              // Internship bookings (your original)
          api.get("/api/admin/mentor-bookings"),       // Only PAID mentorship bookings
        ]);

        setCompanies(companiesRes.data);
        setMentors(mentorsRes.data);
        setBookings(internshipRes.data);
        setMentorBookings(mentorBookingsRes.data);

        // Debug logs - remove later if you want
        console.log("Fetched internship bookings:", internshipRes.data.length);
        console.log("Fetched paid mentor bookings:", mentorBookingsRes.data);
        console.log("Count of paid mentorships:", mentorBookingsRes.data.length);
      } catch (err: any) {
        toast.error("Failed to load dashboard data");
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCompanyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompanyFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMentorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMentorFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMentorPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const totalSlots = companies.reduce((acc, c) => acc + c.total_slots, 0);
  const availableSlotsTotal = companies.reduce((acc, c) => acc + c.available_slots, 0);
  const bookedSlots = totalSlots - availableSlotsTotal;

  const pendingInternshipBookings = bookings.filter(b => b.status === 'pending').length;

  // Correct count: only paid mentorship bookings
  const bookedMentorships = mentorBookings.length;

  const refreshData = async () => {
    try {
      const [companiesRes, mentorsRes, internshipRes, mentorBookingsRes] = await Promise.all([
        api.get("/api/companies"),
        api.get("/api/mentors"),
        api.get("/api/admin/bookings"),
        api.get("/api/admin/mentor-bookings"),
      ]);

      setCompanies(companiesRes.data);
      setMentors(mentorsRes.data);
      setBookings(internshipRes.data);
      setMentorBookings(mentorBookingsRes.data);

      setVisibleCompanies(ITEMS_PER_PAGE);
      setVisibleMentors(ITEMS_PER_PAGE);
    } catch (err) {
      toast.error("Failed to refresh data");
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
    if (companyFile) formData.append("logo", companyFile);

    try {
      if (editingCompany) {
        await api.put(`/api/companies/${editingCompany.id}`, formData);
        toast.success("Company updated successfully");
      } else {
        await api.post("/api/companies", formData);
        toast.success("Company added successfully");
      }
      setCompanyDialogOpen(false);
      setEditingCompany(null);
      setCompanyForm({ name: "", industry: "", description: "", location: "", total_slots: 5, available_slots: 5 });
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
    if (!mentorForm.name || !mentorForm.title || !mentorForm.session_price) {
      toast.error("Please fill in all required fields including session price");
      return;
    }
    const formData = new FormData();
    formData.append("name", mentorForm.name);
    formData.append("title", mentorForm.title);
    formData.append("specialization", mentorForm.specialization || "");
    formData.append("bio", mentorForm.bio || "");
    formData.append("experience", mentorForm.experience.toString());
    formData.append("rating", mentorForm.rating.toString());
    formData.append("session_price", mentorForm.session_price.toString());
    formData.append("zoom_email", mentorForm.zoom_email || "");
    if (mentorFile) formData.append("image", mentorFile);

    try {
      if (editingMentor) {
        await api.put(`/api/mentors/${editingMentor.uuid}`, formData);
        toast.success("Mentor updated successfully");
      } else {
        await api.post("/api/mentors", formData);
        toast.success("Mentor added successfully");
      }
      setMentorDialogOpen(false);
      setEditingMentor(null);
      setMentorForm({
        name: "",
        title: "",
        specialization: "",
        bio: "",
        experience: 5,
        rating: 4.5,
        session_price: 200.00,
        zoom_email: ""
      });
      setMentorFile(null);
      setMentorPreview(null);
      await refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error saving mentor");
    }
  };

  const handleEditMentor = (mentor: Mentor) => {
    setEditingMentor(mentor);
    setMentorForm({
      name: mentor.name,
      title: mentor.title,
      specialization: mentor.specialization || "",
      bio: mentor.bio || "",
      experience: mentor.experience,
      rating: Number(mentor.rating),
      session_price: Number(mentor.session_price) || 200.00,
      zoom_email: mentor.zoom_email || "",
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
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const confirmed = confirm(
      `Approve ${booking.student_name}'s application?\n\n` +
      `A payment link for GHS 2.00 will be sent to ${booking.student_email}.\n` +
      `The student has 24 hours to complete payment.`
    );

    if (!confirmed) return;

    try {
      await api.post(`/api/admin/bookings/${bookingId}/approve`);
      toast.success("Application approved! Payment link for GHS 2.00 sent.");
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'approved' as const } : b
      ));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve application");
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const reason = prompt(
      `Reject ${booking.student_name}'s application?\n\n` +
      `Please provide a reason (will be sent to the student):`,
      ""
    );

    if (!reason || reason.trim().length < 10) {
      toast.error("Rejection reason must be at least 10 characters.");
      return;
    }

    const confirmed = confirm(`Reject application with reason:\n"${reason.trim()}"`);
    if (!confirmed) return;

    try {
      await api.post(`/api/admin/bookings/${bookingId}/reject`, { reason: reason.trim() });
      toast.success("Application rejected and rejection email sent.");
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'rejected' as const } : b
      ));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject application");
    }
  };

  const stats = [
    { 
      icon: Building, 
      label: "Companies", 
      value: companies.length, 
      color: "bg-primary",
      onClick: () => navigate("/companies-dashboard")
    },
    { icon: BarChart3, label: "Total Slots", value: totalSlots, color: "bg-accent" },
    { 
      icon: CheckCircle, 
      label: "Booked Slots", 
      value: bookedSlots, 
      color: "bg-blue-500",
      onClick: () => navigate("/booked-slots")
    },
    { 
      icon: Clock, 
      label: "Pending Internships", 
      value: pendingInternshipBookings, 
      color: "bg-yellow-500",
      onClick: () => navigate("/pending-applications")
    },
    { icon: Users, label: "Available Slots", value: availableSlotsTotal, color: "bg-green-500" },
    { 
      icon: UserCircle, 
      label: "Mentors", 
      value: mentors.length, 
      color: "bg-muted-foreground",
      onClick: () => navigate("/mentors-dashboard")
    },
    { 
      icon: CalendarIcon, 
      label: "Booked Mentorships (Paid)", 
      value: bookedMentorships, 
      color: "bg-purple-500",
      onClick: () => navigate("/admin/mentorship-bookings")
    },
    // { 
    //   icon: Clock, 
    //   label: "Pending Mentorship Payments", 
    //   value: mentorBookings.filter(b => b.status === 'pending').length, 
    //   color: "bg-orange-500"
    // },
    // { 
    //   icon: XCircle, 
    //   label: "Expired Mentorships", 
    //   value: mentorBookings.filter(b => b.status === 'expired').length, 
    //   color: "bg-red-500"
    // },
  ];

  const displayedCompanies = companies.slice(0, visibleCompanies);
  const displayedMentors = mentors.slice(0, visibleMentors);

  const hasMoreCompanies = visibleCompanies < companies.length;
  const hasMoreMentors = visibleMentors < mentors.length;

  const loadMoreCompanies = () => setVisibleCompanies((prev) => prev + ITEMS_PER_PAGE);
  const loadMoreMentors = () => setVisibleMentors((prev) => prev + ITEMS_PER_PAGE);

  const openCvModal = (booking: Booking) => {
    setCurrentCvPath(booking.cv_path);
    setCurrentStudentName(booking.student_name);
    setCurrentCompanyName(booking.company.name);
    setCvModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 lg:pt-32 pb-8 gradient-hero">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-primary-foreground/80">
              Manage companies, mentors, and internship applications
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 -mt-8">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            // className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: stat.onClick ? 1.05 : 1.02 }}
                className={`bg-card rounded-xl p-6 mt-18 shadow-elevated border border-border text-center transition-all ${
                  stat.onClick ? "cursor-pointer hover:shadow-xl" : ""
                }`}
                onClick={stat.onClick}
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
            <TabsList className="grid w-full max-w-lg grid-cols-4 mx-auto">
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building className="h-4 w-4" /> Companies
              </TabsTrigger>
              <TabsTrigger value="mentors" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Mentors
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Bookings
              </TabsTrigger>
              <TabsTrigger value="availability" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Availability
              </TabsTrigger>
            </TabsList>

            {/* Companies Tab */}
            <TabsContent value="companies" className="space-y-8">
              <motion.div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Manage Companies</h2>
                <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="accent"
                      onClick={() => {
                        setEditingCompany(null);
                        setCompanyForm({ name: "", industry: "", description: "", location: "", total_slots: 5, available_slots: 5 });
                        setCompanyFile(null);
                        setCompanyPreview(null);
                      }}
                    >
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
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => companyFileInputRef.current?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" /> Upload Logo
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          placeholder="e.g. San Francisco, CA"
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
                                <img src={`/${company.logo}`} alt={company.name} className="w-8 h-8 rounded object-cover border border-border" />
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
                <div className="text-center">
                  <Button variant="accent" size="lg" onClick={loadMoreCompanies}>
                    Load More Companies
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Mentors Tab */}
            <TabsContent value="mentors" className="space-y-8">
              <motion.div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Manage Mentors</h2>
                <Dialog open={mentorDialogOpen} onOpenChange={setMentorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="accent"
                      onClick={() => {
                        setEditingMentor(null);
                        setMentorForm({
                          name: "",
                          title: "",
                          specialization: "",
                          bio: "",
                          experience: 5,
                          rating: 4.5,
                          session_price: 200.00,
                          zoom_email: ""
                        });
                        setMentorFile(null);
                        setMentorPreview(null);
                      }}
                    >
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => mentorFileInputRef.current?.click()}
                        >
                          Change Photo
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name *</Label>
                          <Input
                            placeholder="Full Name"
                            value={mentorForm.name}
                            onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Job Title *</Label>
                          <Input
                            placeholder="e.g. Senior Developer"
                            value={mentorForm.title}
                            onChange={(e) => setMentorForm({ ...mentorForm, title: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Specialization</Label>
                        <Input
                          placeholder="e.g. Frontend Architecture"
                          value={mentorForm.specialization}
                          onChange={(e) => setMentorForm({ ...mentorForm, specialization: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Bio</Label>
                        <Textarea
                          placeholder="Mentor's professional background..."
                          value={mentorForm.bio}
                          onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Experience (years)</Label>
                          <Input
                            type="number"
                            value={mentorForm.experience}
                            onChange={(e) => setMentorForm({ ...mentorForm, experience: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Rating</Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={mentorForm.rating}
                            onChange={(e) => setMentorForm({ ...mentorForm, rating: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Session Price (GHS) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={mentorForm.session_price}
                            onChange={(e) => setMentorForm({ ...mentorForm, session_price: parseFloat(e.target.value) || 0 })}
                            placeholder="200.00"
                          />
                        </div>
                        <div>
                          <Label>Zoom Email (for auto meeting creation)</Label>
                          <Input
                            type="email"
                            placeholder="mentor@company.com"
                            value={mentorForm.zoom_email}
                            onChange={(e) => setMentorForm({ ...mentorForm, zoom_email: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button variant="accent" className="w-full" onClick={handleSaveMentor}>
                        {editingMentor ? "Update Mentor" : "Add Mentor"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {displayedMentors.map((mentor) => (
                  <motion.div
                    key={mentor.id}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className="bg-card rounded-xl p-6 shadow-soft border border-border"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {mentor.image ? (
                          <img src={`/${mentor.image}`} alt={mentor.name} className="w-12 h-12 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-2xl">User</div>
                        )}
                        <div>
                          <h3 className="font-semibold">{mentor.name}</h3>
                          <p className="text-sm text-accent">{mentor.title}</p>
                        </div>
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
                    <p className="text-sm text-muted-foreground mb-2">{mentor.specialization || "General"}</p>
                    <p className="text-xs text-muted-foreground">
                      {mentor.experience} years experience • ⭐ {Number(mentor.rating).toFixed(1)} • GHS {(Number(mentor.session_price) || 0).toFixed(2)}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {hasMoreMentors && (
                <div className="text-center">
                  <Button variant="accent" size="lg" onClick={loadMoreMentors}>
                    Load More Mentors
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Bookings Tab (Internships) */}
            <TabsContent value="bookings" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <h2 className="text-2xl font-bold">Internship Applications</h2>
              </motion.div>

              <div className="bg-card rounded-xl shadow-elevated overflow-hidden border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
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
                      {bookings.map((booking, index) => (
                        <motion.tr
                          key={booking.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-t border-border hover:bg-secondary/50 transition-colors"
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
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                              booking.status === 'paid' ? 'bg-green-100 text-green-800' :
                              booking.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openCvModal(booking)}
                            >
                              <FileText className="h-4 w-4 mr-2" /> View CV
                            </Button>
                          </td>
                          <td className="p-4 text-right">
                            {booking.status === 'pending' && (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="accent"
                                  size="sm"
                                  onClick={() => handleApproveBooking(booking.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" /> Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRejectBooking(booking.id)}
                                >
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

              {bookings.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                  <p className="text-muted-foreground">
                    Applications will appear here when students apply
                  </p>
                </motion.div>
              )}
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Mentor Weekly Availability</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {mentors.map(mentor => (
                    <div key={mentor.id} className="bg-card p-6 rounded-xl border border-border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{mentor.name}</h3>
                          <p className="text-sm text-muted-foreground">{mentor.title}</p>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedMentorForAvailability(mentor);
                            setAvailabilityForm({
                              selectedDays: [],
                              start_time: "09:00",
                              end_time: "17:00"
                            });
                          }}
                        >
                          Set Schedule
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Configure recurring weekly slots
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Availability Editor Dialog */}
      <Dialog open={!!selectedMentorForAvailability} onOpenChange={() => setSelectedMentorForAvailability(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Set Weekly Availability - {selectedMentorForAvailability?.name}
            </DialogTitle>
            <DialogDescription>
              Define recurring time slots. You can apply the same hours to multiple days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Days Selection */}
            <div>
              <Label>Select Days</Label>
              <div className="grid grid-cols-7 gap-2 mt-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <Button
                    key={day}
                    variant={availabilityForm.selectedDays.includes(index + 1) ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const days = availabilityForm.selectedDays;
                      if (days.includes(index + 1)) {
                        setAvailabilityForm({ ...availabilityForm, selectedDays: days.filter(d => d !== index + 1) });
                      } else {
                        setAvailabilityForm({ ...availabilityForm, selectedDays: [...days, index + 1] });
                      }
                    }}
                  >
                    {day}
                  </Button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAvailabilityForm({ ...availabilityForm, selectedDays: [1,2,3,4,5] })}
                >
                  Weekdays (Mon–Fri)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAvailabilityForm({ ...availabilityForm, selectedDays: [6,7] })}
                >
                  Weekend
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAvailabilityForm({ ...availabilityForm, selectedDays: [1,2,3,4,5,6,7] })}
                >
                  All Week
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAvailabilityForm({ ...availabilityForm, selectedDays: [] })}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input 
                  type="time" 
                  value={availabilityForm.start_time} 
                  onChange={e => setAvailabilityForm({...availabilityForm, start_time: e.target.value})}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input 
                  type="time" 
                  value={availabilityForm.end_time} 
                  onChange={e => setAvailabilityForm({...availabilityForm, end_time: e.target.value})}
                />
              </div>
            </div>

            <Button 
              className="w-full"
              disabled={availabilityForm.selectedDays.length === 0}
              onClick={async () => {
                if (!selectedMentorForAvailability || availabilityForm.selectedDays.length === 0) return;

                try {
                  const dayNames = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                  const requests = availabilityForm.selectedDays.map(dayIndex => {
                    const dayName = dayNames[dayIndex - 1];
                    return api.post(`/api/mentors/${selectedMentorForAvailability.uuid}/availabilities`, {
                      day_of_week: dayName,
                      start_time: availabilityForm.start_time,
                      end_time: availabilityForm.end_time
                    });
                  });

                  await Promise.all(requests);
                  toast.success(`Availability set for ${availabilityForm.selectedDays.length} day(s)`);
                  setAvailabilityForm({ selectedDays: [], start_time: "09:00", end_time: "17:00" });
                } catch (err) {
                  toast.error("Failed to save availability");
                }
              }}
            >
              Apply to Selected Days
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CV Viewer Modal */}
      <Dialog open={cvModalOpen} onOpenChange={setCvModalOpen}>
        <DialogContent 
          className="max-w-5xl w-full h-[90vh] max-h-screen p-0 flex flex-col"
          aria-describedby={undefined}
        >
          <DialogHeader className="p-6 pb-3 flex flex-row items-center justify-between border-b bg-card">
            <div>
              <DialogTitle className="text-xl">
                CV - {currentStudentName}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Application for {currentCompanyName}
              </DialogDescription>
            </div>
            {currentCvPath && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={getCvUrl(currentCvPath)}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </a>
              </Button>
            )}
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-gray-50">
            {currentCvPath ? (
              <iframe
                src={getCvUrl(currentCvPath)}
                className="w-full h-full"
                title="CV Viewer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p>No CV uploaded</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Dashboard;