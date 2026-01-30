'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MapPin, Briefcase, Users, Search, Filter, ChevronRight, LogIn, XCircle } from "lucide-react";
import api from "@/lib/api";
import { Link } from "react-router-dom";

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
  applications_open: boolean; // ← NEW: controls apply button
}

const ITEMS_PER_PAGE = 9;
const REFRESH_INTERVAL = 25000;

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

const Internships = () => {
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [currentDescriptionCompany, setCurrentDescriptionCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    studentId: "",
    university: "",
    cv: null as File | null,
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/api/companies");
        setAllCompanies(res.data);
        setIsAuthenticated(true);
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setIsAuthenticated(false);
        } else {
          toast.error("Failed to load internship opportunities");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();

    const interval = setInterval(fetchCompanies, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const industries = ["all", ...Array.from(new Set(allCompanies.map((c) => c.industry)))];

  const filteredCompanies = allCompanies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.requirements?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesIndustry = selectedIndustry === "all" || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const displayedCompanies = filteredCompanies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCompanies.length;

  const loadMore = () => setVisibleCount((prev) => prev + ITEMS_PER_PAGE);

  const openDescriptionModal = (company: Company) => {
    setCurrentDescriptionCompany(company);
    setDescriptionOpen(true);
  };

  const handleBooking = async () => {
    if (!selectedCompany) return;

    if (!formData.studentName || !formData.studentEmail || !formData.studentPhone || !formData.studentId || !formData.university || !formData.cv) {
      toast.error("Please fill all fields and upload your CV");
      return;
    }

    const bookingData = new FormData();
    bookingData.append("company_id", selectedCompany.id);
    bookingData.append("student_name", formData.studentName);
    bookingData.append("student_email", formData.studentEmail);
    bookingData.append("student_phone", formData.studentPhone);
    bookingData.append("student_id", formData.studentId);
    bookingData.append("university", formData.university);
    bookingData.append("cv", formData.cv!);

    try {
      await api.post("/api/bookings", bookingData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Application submitted! You'll receive an email after admin review.");
      setBookingOpen(false);
      setFormData({
        studentName: "",
        studentEmail: "",
        studentPhone: "",
        studentId: "",
        university: "",
        cv: null,
      });
      setSelectedCompany(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit application");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading internship opportunities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 lg:pt-32 pb-12 gradient-hero">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4"
            >
              Explore{" "}
              <span className="relative inline-block">
                <span className="text-accent">Internships</span>
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-1 bg-accent rounded-full"
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
              className="text-primary-foreground/80 text-lg"
            >
              Discover opportunities at top companies and apply instantly.
            </motion.p>
          </motion.div>
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
              <h2 className="text-4xl font-bold mb-6">Create an account to explore internships</h2>
              <p className="text-xl text-muted-foreground mb-10">
                Internship listings are only available to registered users. Sign up today!
              </p>
              <Link to="/auth">
                <Button variant="accent" size="lg" className="px-10 py-6 text-lg">
                  Register
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {isAuthenticated && (
        <>
          <section className="py-8 border-b border-border bg-card">
            <div className="container mx-auto px-4 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col md:flex-row gap-4 items-center justify-between"
              >
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search companies, industries, or requirements..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setVisibleCount(ITEMS_PER_PAGE);
                    }}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={selectedIndustry}
                    onChange={(e) => {
                      setSelectedIndustry(e.target.value);
                      setVisibleCount(ITEMS_PER_PAGE);
                    }}
                    className="bg-secondary border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry === "all" ? "All Industries" : industry}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="py-12 lg:py-16">
            <div className="container mx-auto px-4 lg:px-8">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground mb-6"
              >
                Showing {displayedCompanies.length} of {filteredCompanies.length}{" "}
                {filteredCompanies.length === 1 ? "company" : "companies"}
              </motion.p>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {displayedCompanies.map((company) => {
                  const hasLongDescription = company.description && company.description.length > 120;
                  const reqLines = company.requirements
                    ? company.requirements.split("\n").filter((line) => line.trim())
                    : [];

                  return (
                    <motion.div
                      key={company.id}
                      variants={itemVariants}
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-all duration-300 border border-border"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <motion.div
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                            className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center overflow-hidden"
                          >
                            {company.logo ? (
                              <img
                                src={`/${company.logo}`}
                                alt={company.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-3xl">🏢</span>
                            )}
                          </motion.div>
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{company.name}</h3>
                            <p className="text-accent text-sm font-medium">{company.industry}</p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            company.is_paid
                              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                          }`}
                        >
                          {company.is_paid ? (
                            <>₵ Paid Internship</>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Unpaid Internship
                            </>
                          )}
                        </span>
                      </div>

                      <div className="text-muted-foreground text-sm mb-4">
                        <div className="flex items-end gap-2">
                          <p className="line-clamp-2 flex-1">
                            {company.description || "No description available."}
                          </p>
                          {hasLongDescription && (
                            <button
                              onClick={() => openDescriptionModal(company)}
                              className="text-accent hover:text-accent/80 text-xs font-medium flex items-center gap-1 whitespace-nowrap mb-1"
                            >
                              Read more <ChevronRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {!hasLongDescription && reqLines.length > 0 && (
                        <div className="text-muted-foreground text-xs mb-4">
                          <p className="font-medium mb-1 text-accent">Requirements:</p>
                          <ol className="list-decimal pl-4 space-y-0.5 max-h-16 overflow-hidden">
                            {reqLines.slice(0, 4).map((req, idx) => (
                              <li key={idx} className="line-clamp-1">{req.trim()}</li>
                            ))}
                            {reqLines.length > 4 && <li className="italic">+{reqLines.length - 4} more</li>}
                          </ol>
                        </div>
                      )}

                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        {company.location || "Remote / On-site"}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="text-accent font-semibold">
                              {company.available_slots}
                            </span>
                            /{company.total_slots} slots available
                          </span>
                        </div>

                        <Dialog
                          open={bookingOpen && selectedCompany?.id === company.id}
                          onOpenChange={(open) => {
                            setBookingOpen(open);
                            if (open) setSelectedCompany(company);
                            else setSelectedCompany(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant={
                                company.available_slots > 0 && company.applications_open
                                  ? "accent"
                                  : "secondary"
                              }
                              size="sm"
                              disabled={company.available_slots === 0 || !company.applications_open}
                            >
                              {company.applications_open
                                ? (company.available_slots > 0 ? "Apply Now" : "Fully Booked")
                                : "Application Closed"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-3">
                                {company.logo ? (
                                  <img src={`/${company.logo}`} alt={company.name} className="w-10 h-10 rounded object-cover" />
                                ) : (
                                  <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center text-2xl">🏢</div>
                                )}
                                Apply for Internship at {company.name}
                              </DialogTitle>
                              <DialogDescription>
                                Submit your details and CV. Your application will be reviewed before approval.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 mt-4">
                              <div>
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                  id="name"
                                  value={formData.studentName}
                                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                  placeholder="John Doe"
                                />
                              </div>
                              <div>
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={formData.studentEmail}
                                  onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                                  placeholder="john@example.com"
                                />
                              </div>
                              <div>
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                  id="phone"
                                  value={formData.studentPhone}
                                  onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                                  placeholder="+233 123 456 789"
                                />
                              </div>
                              <div>
                                <Label htmlFor="studentId">Student ID *</Label>
                                <Input
                                  id="studentId"
                                  value={formData.studentId}
                                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                  placeholder="e.g., S123456"
                                />
                              </div>
                              <div>
                                <Label htmlFor="university">University/Institution *</Label>
                                <Input
                                  id="university"
                                  value={formData.university}
                                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                  placeholder="University of Ghana"
                                />
                              </div>
                              <div>
                                <Label htmlFor="cv">Upload CV (PDF only) *</Label>
                                <Input
                                  id="cv"
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => setFormData({ ...formData, cv: e.target.files?.[0] || null })}
                                />
                                {formData.cv && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Selected: {formData.cv.name}
                                  </p>
                                )}
                              </div>

                              <Button variant="accent" className="w-full" onClick={handleBooking}>
                                Submit Application
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {hasMore && (
                <div className="text-center mt-12">
                  <Button
                    variant="accent"
                    size="lg"
                    onClick={loadMore}
                    className="px-8"
                  >
                    Load More
                  </Button>
                </div>
              )}

              {filteredCompanies.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No internships found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter settings
                  </p>
                </motion.div>
              )}
            </div>
          </section>

          <Dialog open={descriptionOpen} onOpenChange={setDescriptionOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4 text-xl">
                  {currentDescriptionCompany?.logo ? (
                    <img
                      src={`/${currentDescriptionCompany.logo}`}
                      alt={currentDescriptionCompany.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center text-3xl">🏢</div>
                  )}
                  {currentDescriptionCompany?.name}
                </DialogTitle>
                <DialogDescription className="text-base flex items-center gap-3">
                  {currentDescriptionCompany?.industry} •{" "}
                  {currentDescriptionCompany?.location || "Remote / On-site"} •{" "}
                  <span
                    className={
                      currentDescriptionCompany?.is_paid
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {currentDescriptionCompany?.is_paid ? "PaidInternship" : "UnpaidInternship"}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">About this opportunity</h4>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {currentDescriptionCompany?.description || "No description available."}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-accent">Requirements</h4>
                  {currentDescriptionCompany?.requirements && currentDescriptionCompany.requirements.trim() ? (
                    <ol className="list-decimal pl-6 space-y-1.5 text-muted-foreground">
                      {currentDescriptionCompany.requirements
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((req, index) => (
                          <li key={index}>{req.trim()}</li>
                        ))}
                    </ol>
                  ) : (
                    <p className="text-muted-foreground italic">No specific requirements listed.</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Internships;