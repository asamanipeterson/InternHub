'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button"; // Added for Load More button
import { Building, MapPin, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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

const ITEMS_PER_PAGE = 9; // Load 9 companies at a time

const CompaniesDashboard = () => {
  const navigate = useNavigate();
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [visibleCompanies, setVisibleCompanies] = useState<Company[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/api/companies");
        setAllCompanies(res.data);
        // Show only first 9 initially
        setVisibleCompanies(res.data.slice(0, ITEMS_PER_PAGE));
      } catch (err) {
        toast.error("Failed to load companies");
        setAllCompanies([]);
        setVisibleCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const totalSlots = allCompanies.reduce((acc, c) => acc + c.total_slots, 0);
  const bookedSlots = allCompanies.reduce((acc, c) => acc + (c.total_slots - c.available_slots), 0);

  const loadMore = () => {
    const nextCount = visibleCount + ITEMS_PER_PAGE;
    setVisibleCompanies(allCompanies.slice(0, nextCount));
    setVisibleCount(nextCount);
  };

  const hasMore = visibleCount < allCompanies.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg">Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 lg:pt-32 pb-12 gradient-hero">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Partner Companies
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            {allCompanies.length} companies offering {totalSlots} internship slots ({bookedSlots} booked)
          </p>
        </div>
      </section>

      <section className="py-12">
        <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
        <div className="container mx-auto px-4 lg:px-8">
          {allCompanies.length === 0 ? (
            <div className="text-center py-20">
              <Building className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-semibold">No companies yet</h3>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleCompanies.map((company, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl p-6 shadow-elevated border border-border hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {company.logo ? (
                        <img
                          src={`/${company.logo}`}
                          alt={company.name}
                          className="w-16 h-16 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                          <Building className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{company.name}</h3>
                        <p className="text-sm text-accent">{company.industry}</p>
                      </div>
                    </div>
                    {company.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4" /> {company.location}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Available Slots</p>
                        <p className="text-2xl font-bold">
                          {company.available_slots}{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            / {company.total_slots}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Booked</p>
                        <p className="text-lg font-semibold text-green-600">
                          {company.total_slots - company.available_slots}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <Button
                    variant="accent"
                    size="lg"
                    onClick={loadMore}
                    className="px-8 py-6 text-lg"
                  >
                    Load More Companies
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CompaniesDashboard;