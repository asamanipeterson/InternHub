import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useBookingStore, Company, Counselor } from "@/stores/bookingStore";
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
} from "lucide-react";

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
  const {
    companies,
    bookings,
    counselors,
    addCompany,
    updateCompany,
    deleteCompany,
    addCounselor,
    updateCounselor,
    deleteCounselor,
  } = useBookingStore();

  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [counselorDialogOpen, setCounselorDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null);

  const [companyForm, setCompanyForm] = useState({
    name: "",
    logo: "🏢",
    industry: "",
    description: "",
    location: "",
    totalSlots: 5,
    availableSlots: 5,
  });

  const [counselorForm, setCounselorForm] = useState({
    name: "",
    title: "",
    specialization: "",
    bio: "",
    image: "👨‍💼",
    experience: 5,
    rating: 4.5,
  });

  const totalSlots = companies.reduce((acc, c) => acc + c.totalSlots, 0);
  const bookedSlots = bookings.length;

  const handleSaveCompany = () => {
    if (!companyForm.name || !companyForm.industry) {
      toast.error("Please fill in required fields");
      return;
    }

    if (editingCompany) {
      updateCompany(editingCompany.id, companyForm);
      toast.success("Company updated successfully");
    } else {
      addCompany(companyForm);
      toast.success("Company added successfully");
    }

    setCompanyDialogOpen(false);
    setEditingCompany(null);
    setCompanyForm({
      name: "",
      logo: "🏢",
      industry: "",
      description: "",
      location: "",
      totalSlots: 5,
      availableSlots: 5,
    });
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setCompanyForm(company);
    setCompanyDialogOpen(true);
  };

  const handleDeleteCompany = (id: string) => {
    if (confirm("Are you sure you want to delete this company?")) {
      deleteCompany(id);
      toast.success("Company deleted successfully");
    }
  };

  const handleSaveCounselor = () => {
    if (!counselorForm.name || !counselorForm.title) {
      toast.error("Please fill in required fields");
      return;
    }

    if (editingCounselor) {
      updateCounselor(editingCounselor.id, counselorForm);
      toast.success("Counselor updated successfully");
    } else {
      addCounselor(counselorForm);
      toast.success("Counselor added successfully");
    }

    setCounselorDialogOpen(false);
    setEditingCounselor(null);
    setCounselorForm({
      name: "",
      title: "",
      specialization: "",
      bio: "",
      image: "👨‍💼",
      experience: 5,
      rating: 4.5,
    });
  };

  const handleEditCounselor = (counselor: Counselor) => {
    setEditingCounselor(counselor);
    setCounselorForm(counselor);
    setCounselorDialogOpen(true);
  };

  const handleDeleteCounselor = (id: string) => {
    if (confirm("Are you sure you want to delete this counselor?")) {
      deleteCounselor(id);
      toast.success("Counselor deleted successfully");
    }
  };

  const stats = [
    { icon: Building, label: "Companies", value: companies.length, color: "bg-primary" },
    { icon: BarChart3, label: "Total Slots", value: totalSlots, color: "bg-accent" },
    { icon: BookOpen, label: "Booked", value: bookedSlots, color: "bg-destructive" },
    { icon: UserCircle, label: "Counselors", value: counselors.length, color: "bg-muted-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
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
              Manage companies, slots, and counselors
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 -mt-8">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-card rounded-xl p-6 shadow-elevated border border-border text-center"
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

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <Tabs defaultValue="companies" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building className="h-4 w-4" /> Companies
              </TabsTrigger>
              <TabsTrigger value="counselors" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Counselors
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Bookings
              </TabsTrigger>
            </TabsList>

            {/* Companies Tab */}
            <TabsContent value="companies" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <h2 className="text-xl font-semibold">Manage Companies</h2>
                <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="accent" onClick={() => {
                      setEditingCompany(null);
                      setCompanyForm({
                        name: "",
                        logo: "🏢",
                        industry: "",
                        description: "",
                        location: "",
                        totalSlots: 5,
                        availableSlots: 5,
                      });
                    }}>
                      <Plus className="h-4 w-4 mr-2" /> Add Company
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCompany ? "Edit Company" : "Add New Company"}
                      </DialogTitle>
                      <DialogDescription>
                        Fill in the company details below
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Company Name *</Label>
                          <Input
                            value={companyForm.name}
                            onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Logo (emoji)</Label>
                          <Input
                            value={companyForm.logo}
                            onChange={(e) => setCompanyForm({ ...companyForm, logo: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Industry *</Label>
                          <Input
                            value={companyForm.industry}
                            onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={companyForm.location}
                            onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={companyForm.description}
                          onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Total Slots</Label>
                          <Input
                            type="number"
                            value={companyForm.totalSlots}
                            onChange={(e) => setCompanyForm({
                              ...companyForm,
                              totalSlots: parseInt(e.target.value) || 0,
                            })}
                          />
                        </div>
                        <div>
                          <Label>Available Slots</Label>
                          <Input
                            type="number"
                            value={companyForm.availableSlots}
                            onChange={(e) => setCompanyForm({
                              ...companyForm,
                              availableSlots: parseInt(e.target.value) || 0,
                            })}
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl shadow-elevated overflow-hidden border border-border"
              >
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
                      {companies.map((company, index) => (
                        <motion.tr
                          key={company.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-t border-border hover:bg-secondary/50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{company.logo}</span>
                              <span className="font-medium">{company.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground hidden md:table-cell">
                            {company.industry}
                          </td>
                          <td className="p-4 text-muted-foreground hidden md:table-cell">
                            {company.location}
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-accent font-semibold">{company.availableSlots}</span>
                            /{company.totalSlots}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditCompany(company)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCompany(company.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </TabsContent>

            {/* Counselors Tab */}
            <TabsContent value="counselors" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <h2 className="text-xl font-semibold">Manage Counselors</h2>
                <Dialog open={counselorDialogOpen} onOpenChange={setCounselorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="accent" onClick={() => {
                      setEditingCounselor(null);
                      setCounselorForm({
                        name: "",
                        title: "",
                        specialization: "",
                        bio: "",
                        image: "👨‍💼",
                        experience: 5,
                        rating: 4.5,
                      });
                    }}>
                      <Plus className="h-4 w-4 mr-2" /> Add Counselor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCounselor ? "Edit Counselor" : "Add New Counselor"}
                      </DialogTitle>
                      <DialogDescription>
                        Fill in the counselor details below
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name *</Label>
                          <Input
                            value={counselorForm.name}
                            onChange={(e) => setCounselorForm({ ...counselorForm, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Image (emoji)</Label>
                          <Input
                            value={counselorForm.image}
                            onChange={(e) => setCounselorForm({ ...counselorForm, image: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Title *</Label>
                          <Input
                            value={counselorForm.title}
                            onChange={(e) => setCounselorForm({ ...counselorForm, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Specialization</Label>
                          <Input
                            value={counselorForm.specialization}
                            onChange={(e) => setCounselorForm({ ...counselorForm, specialization: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Bio</Label>
                        <Textarea
                          value={counselorForm.bio}
                          onChange={(e) => setCounselorForm({ ...counselorForm, bio: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Experience (years)</Label>
                          <Input
                            type="number"
                            value={counselorForm.experience}
                            onChange={(e) => setCounselorForm({
                              ...counselorForm,
                              experience: parseInt(e.target.value) || 0,
                            })}
                          />
                        </div>
                        <div>
                          <Label>Rating</Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={counselorForm.rating}
                            onChange={(e) => setCounselorForm({
                              ...counselorForm,
                              rating: parseFloat(e.target.value) || 0,
                            })}
                          />
                        </div>
                      </div>
                      <Button variant="accent" className="w-full" onClick={handleSaveCounselor}>
                        {editingCounselor ? "Update Counselor" : "Add Counselor"}
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
                {counselors.map((counselor, index) => (
                  <motion.div
                    key={counselor.id}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className="bg-card rounded-xl p-6 shadow-soft border border-border"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{counselor.image}</span>
                        <div>
                          <h3 className="font-semibold">{counselor.name}</h3>
                          <p className="text-sm text-accent">{counselor.title}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditCounselor(counselor)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCounselor(counselor.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{counselor.specialization}</p>
                    <p className="text-xs text-muted-foreground">{counselor.experience} years experience • ⭐ {counselor.rating}</p>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-semibold"
              >
                Recent Bookings
              </motion.h2>

              {bookings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-xl p-12 shadow-soft text-center border border-border"
                >
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Bookings will appear here when students reserve internship slots
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl shadow-elevated overflow-hidden border border-border"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="text-left p-4 font-medium">Student</th>
                          <th className="text-left p-4 font-medium hidden md:table-cell">Email</th>
                          <th className="text-left p-4 font-medium">Company</th>
                          <th className="text-left p-4 font-medium hidden md:table-cell">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking, index) => {
                          const company = companies.find((c) => c.id === booking.companyId);
                          return (
                            <motion.tr
                              key={booking.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-t border-border"
                            >
                              <td className="p-4 font-medium">{booking.studentName}</td>
                              <td className="p-4 text-muted-foreground hidden md:table-cell">
                                {booking.studentEmail}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span>{company?.logo}</span>
                                  <span>{company?.name}</span>
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground hidden md:table-cell">
                                {new Date(booking.bookedAt).toLocaleDateString()}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
