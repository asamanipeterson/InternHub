'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, FileText, Download } from "lucide-react";
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
}

const PendingApplications = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [currentCvPath, setCurrentCvPath] = useState<string | null>(null);
  const [currentStudentName, setCurrentStudentName] = useState("");

  const getCvUrl = (path: string) => `${api.defaults.baseURL}/storage/${path}`;

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get("/api/admin/bookings");
        const pending = res.data.filter((b: any) => b.status === 'pending');
        setBookings(pending);
      } catch (err) {
        toast.error("Failed to load pending applications");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const openCvModal = (booking: Booking) => {
    setCurrentCvPath(booking.cv_path);
    setCurrentStudentName(booking.student_name);
    setCvModalOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 lg:pt-32 pb-12 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Pending Applications
          </h1>
          <p className="text-primary-foreground/80 text-lg">{bookings.length} awaiting review</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {bookings.length === 0 ? (
            <div className="text-center py-20">
              <Clock className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-50" />
              <h3 className="text-2xl font-semibold">No pending applications</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-xl p-6 shadow-elevated border border-border flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{booking.student_name}</h3>
                    <p className="text-muted-foreground">{booking.university} → {booking.company.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">Applied {new Date(booking.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" onClick={() => openCvModal(booking)}>
                    <FileText className="h-5 w-5 mr-2" /> View CV
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={cvModalOpen} onOpenChange={setCvModalOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>CV - {currentStudentName}</DialogTitle>
            <DialogDescription>Pending application review</DialogDescription>
          </DialogHeader>
          {currentCvPath && (
            <>
              <iframe src={getCvUrl(currentCvPath)} className="flex-1 w-full" />
              <div className="p-4 border-t bg-card">
                <Button asChild variant="outline">
                  <a href={getCvUrl(currentCvPath)} download target="_blank">
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PendingApplications;