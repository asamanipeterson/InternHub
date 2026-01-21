'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Clock, FileText, Download, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "sonner";

interface Booking {
  id: string;
  company: { name: string };
  student_name: string;
  student_email: string;
  university: string;
  cv_path: string;
  created_at: string;
  status: string;
}

const PendingApplications = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [currentCvPath, setCurrentCvPath] = useState<string | null>(null);
  const [currentStudentName, setCurrentStudentName] = useState("");

  const getCvUrl = (path: string) => `${api.defaults.baseURL}/storage/${path}`;

  const fetchPending = async () => {
    try {
      const res = await api.get("/api/admin/forallbookings");
      const pending = res.data.filter((b: any) => b.status === 'pending');
      setBookings(pending);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load pending applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const openCvModal = (booking: Booking) => {
    setCurrentCvPath(booking.cv_path);
    setCurrentStudentName(booking.student_name);
    setCvModalOpen(true);
  };

  const handleApproveBooking = async (bookingId: string, studentName: string, studentEmail: string) => {
    const confirmed = confirm(
      `Approve ${studentName}'s application?\n\nA payment link will be sent to ${studentEmail}.`
    );

    if (!confirmed) return;

    try {
      await api.post(`/api/admin/bookings/${bookingId}/approve`);
      toast.success("Application approved!");
      await fetchPending(); // Refresh the list
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve application");
    }
  };

  const handleRejectBooking = async (bookingId: string, studentName: string) => {
    const reason = prompt(
      `Please provide a reason for rejecting ${studentName}'s application (sent to student):`,
      ""
    );

    if (!reason || reason.trim().length < 10) {
      toast.error("Rejection reason must be at least 10 characters.");
      return;
    }

    try {
      await api.post(`/api/admin/bookings/${bookingId}/reject`, { reason: reason.trim() });
      toast.success("Application rejected.");
      await fetchPending(); // Refresh the list
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject application");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <p className="text-lg">Loading pending applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 lg:pt-32 pb-12 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Pending Applications
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            {bookings.length} application{bookings.length !== 1 ? 's' : ''} awaiting review
          </p>
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
            <div className="text-center py-20">
              <Clock className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-50" />
              <h3 className="text-2xl font-semibold">No pending applications</h3>
              <p className="text-muted-foreground mt-2">
                New student applications will appear here when submitted
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-card rounded-xl p-6 shadow-elevated border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{booking.student_name}</h3>
                    <p className="text-muted-foreground">
                      {booking.university} → {booking.company.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Applied on {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCvModal(booking)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View CV
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          handleApproveBooking(booking.id, booking.student_name, booking.student_email)
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectBooking(booking.id, booking.student_name)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CV Preview Modal */}
      <Dialog open={cvModalOpen} onOpenChange={setCvModalOpen}>
        <DialogContent className="max-w-5xl w-full h-[90vh] max-h-screen p-0 flex flex-col">
          <DialogHeader className="p-6 pb-3 flex flex-row items-center justify-between border-b bg-card">
            <div>
              <DialogTitle className="text-xl">CV - {currentStudentName}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Pending application review
              </DialogDescription>
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
              <iframe
                src={getCvUrl(currentCvPath)}
                className="w-full h-full"
                title={`CV of ${currentStudentName}`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
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

export default PendingApplications;