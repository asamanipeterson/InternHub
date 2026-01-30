'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { BookOpen, FileText, CheckCircle, XCircle, Download } from "lucide-react";
import api from "@/lib/api";

interface Booking {
  id: string;
  company: { name: string; industry: string };
  student_name: string;
  student_email: string;
  university: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'expired';
  created_at: string;
  cv_path?: string;
}

const REFRESH_INTERVAL = 25000;

const IndustryAdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    rejected: 0,
    expired: 0,
  });

  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [currentCvPath, setCurrentCvPath] = useState<string | null>(null);
  const [currentStudentName, setCurrentStudentName] = useState<string>("");
  const [currentCompanyName, setCurrentCompanyName] = useState<string>("");

  const getCvUrl = (path: string) => `${api.defaults.baseURL}/storage/${path}`;

  const fetchData = async () => {
    try {
      const res = await api.get("/api/industry-admin/bookings");
      const fetchedBookings = res.data.bookings || [];
      setBookings(fetchedBookings);

      const calculatedStats = {
        total: fetchedBookings.length,
        pending: fetchedBookings.filter((b: Booking) => b.status === 'pending').length,
        approved: fetchedBookings.filter((b: Booking) => b.status === 'approved').length,
        paid: fetchedBookings.filter((b: Booking) => b.status === 'paid').length,
        rejected: fetchedBookings.filter((b: Booking) => b.status === 'rejected').length,
        expired: fetchedBookings.filter((b: Booking) => b.status === 'expired').length,
      };
      setStats(calculatedStats);
    } catch (err: any) {
      toast.error("Failed to load your applications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const openCvModal = (booking: Booking) => {
    if (!booking.cv_path) {
      toast.info("No CV uploaded for this application");
      return;
    }
    setCurrentCvPath(booking.cv_path);
    setCurrentStudentName(booking.student_name);
    setCurrentCompanyName(booking.company.name);
    setCvModalOpen(true);
  };

  const handleApproveBooking = async (bookingId: string, studentName: string, studentEmail: string) => {
    const confirmed = confirm(`Approve ${studentName}'s application?\n\nA payment link will be sent to ${studentEmail}.`);
    if (!confirmed) return;
    try {
      await api.post(`/api/admin/bookings/${bookingId}/approve`);
      toast.success("Application approved!");
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve application");
    }
  };

  const handleRejectBooking = async (bookingId: string, studentName: string) => {
    const reason = prompt(`Please provide a reason for rejecting ${studentName}'s application:`, "");
    if (!reason || reason.trim().length < 10) {
      toast.error("Rejection reason must be at least 10 characters.");
      return;
    }
    try {
      await api.post(`/api/admin/bookings/${bookingId}/reject`, { reason: reason.trim() });
      toast.success("Application rejected.");
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject application");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return "bg-yellow-100 text-yellow-800";
      case 'approved': return "bg-blue-100 text-blue-800";
      case 'paid': return "bg-green-100 text-green-800";
      case 'rejected': return "bg-red-100 text-red-800";
      case 'expired': return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Replaced old heading with the animated Hero Section */}
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
              Your Industry{" "}
              <span className="relative inline-block">
                <span className="text-accent">Applications</span>
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
              Manage and review student internship applications from your assigned companies.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          
          {/* Maintained Original Card Design exactly as requested */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-12">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{stats.approved}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600">Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Expired</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-600">{stats.expired}</p>
              </CardContent>
            </Card>
          </div>

          {/* Bookings Table Section */}
          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground">
                Student applications from your assigned industries will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>University</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">CV</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{booking.student_name}</TableCell>
                      <TableCell className="text-muted-foreground">{booking.university}</TableCell>
                      <TableCell>{booking.company.name}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {booking.cv_path && (
                          <Button variant="ghost" size="sm" onClick={() => openCvModal(booking)}>
                            <FileText className="h-4 w-4 mr-2" /> View CV
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {booking.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => handleApproveBooking(booking.id, booking.student_name, booking.student_email)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectBooking(booking.id, booking.student_name)}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* CV Preview Modal */}
          <Dialog open={cvModalOpen} onOpenChange={setCvModalOpen}>
            <DialogContent className="max-w-5xl w-full h-[90vh] max-h-screen p-0 flex flex-col">
              <DialogHeader className="p-6 pb-3 flex flex-row items-center justify-between border-b bg-card">
                <div>
                  <DialogTitle className="text-xl">CV - {currentStudentName}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Application for {currentCompanyName}
                  </DialogDescription>
                </div>
                {currentCvPath && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={getCvUrl(currentCvPath!)} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" /> Download PDF
                    </a>
                  </Button>
                )}
              </DialogHeader>
              <div className="flex-1 overflow-hidden bg-gray-50">
                {currentCvPath ? (
                  <iframe src={getCvUrl(currentCvPath)} className="w-full h-full" title={`CV of ${currentStudentName}`} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <FileText className="w-16 h-16 mb-4 opacity-50" />
                    <p>No CV uploaded for this application</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IndustryAdminDashboard;