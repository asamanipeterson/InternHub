'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Building,
  User,
  Mail,
  Calendar,
  FileText,
  Download,
  CheckCircle,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

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
}

const BookedSlots = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [currentCvPath, setCurrentCvPath] = useState<string | null>(null);
  const [currentStudentName, setCurrentStudentName] = useState<string>("");
  const [currentCompanyName, setCurrentCompanyName] = useState<string>("");

  const getCvUrl = (path: string) => {
    return `${api.defaults.baseURL}/storage/${path}`;
  };

  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        const res = await api.get("/api/admin/forallbookings");
        // Only show confirmed/paid bookings
        const paidBookings = res.data.filter((b: Booking) => b.status === 'paid');
        setBookings(paidBookings);
      } catch (err: any) {
        toast.error("Failed to load booked slots");
        console.error(err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookedSlots();
  }, []);

  const openCvModal = (booking: Booking) => {
    setCurrentCvPath(booking.cv_path);
    setCurrentStudentName(booking.student_name);
    setCurrentCompanyName(booking.company.name);
    setCvModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading booked slots...</p>
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
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Booked Internship Slots
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              {bookings.length} confirmed and paid placement{bookings.length !== 1 ? 's' : ''}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        
        <div className="container mx-auto px-4 lg:px-8">
          <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          {bookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <CheckCircle className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-semibold mb-3">No Booked Slots Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                When students complete payment after approval, their confirmed placements will appear here.
              </p>
            </motion.div>
          ) : (
            <div className="bg-card rounded-xl shadow-elevated overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left p-6 font-medium">Student</th>
                      <th className="text-left p-6 font-medium">Company</th>
                      <th className="text-left p-6 font-medium hidden md:table-cell">Email</th>
                      <th className="text-left p-6 font-medium hidden lg:table-cell">University</th>
                      <th className="text-center p-6 font-medium hidden md:table-cell">Applied On</th>
                      <th className="text-center p-6 font-medium">CV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, index) => (
                      <motion.tr
                        key={booking.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-t border-border hover:bg-secondary/50 transition-colors"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-green-700" />
                            </div>
                            <div>
                              <p className="font-semibold">{booking.student_name}</p>
                              <p className="text-sm text-muted-foreground">{booking.student_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-accent" />
                            <span className="font-medium">{booking.company.name}</span>
                          </div>
                        </td>
                        <td className="p-6 hidden md:table-cell">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {booking.student_email}
                          </div>
                        </td>
                        <td className="p-6 hidden lg:table-cell text-muted-foreground">
                          {booking.university}
                        </td>
                        <td className="p-6 text-center hidden md:table-cell text-muted-foreground">
                          <div className="flex items-center justify-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openCvModal(booking)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View CV
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CV Viewer Modal */}
      <Dialog open={cvModalOpen} onOpenChange={setCvModalOpen}>
        <DialogContent className="max-w-5xl w-full h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-6 pb-3 border-b bg-card flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                CV - {currentStudentName}
              </DialogTitle>
              <DialogDescription>
                Confirmed placement at {currentCompanyName}
              </DialogDescription>
            </div>
            {currentCvPath && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = getCvUrl(currentCvPath);
                  link.download = 'cv.pdf';
                  link.target = '_blank';
                  link.rel = 'noopener noreferrer';
                  link.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </Button>
            )}
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-gray-50">
            {currentCvPath ? (
              <iframe
                src={getCvUrl(currentCvPath)}
                className="w-full h-full"
                title="Student CV"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>No CV available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default BookedSlots;