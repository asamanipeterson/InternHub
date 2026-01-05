'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { User, Star } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Mentor {
  id: string;
  name: string;
  title: string;
  specialization: string | null;
  bio: string | null;
  image: string | null;
  experience: number;
  rating: number;
}

const MentorsDashboard = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get("/api/mentors");
        setMentors(res.data);
      } catch (err) {
        toast.error("Failed to load mentors");
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading mentors...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 lg:pt-32 pb-12 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Mentors
          </h1>
          <p className="text-primary-foreground/80 text-lg">{mentors.length} experienced professionals</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl p-6 shadow-elevated border border-border"
              >
                <div className="flex items-center gap-4 mb-4">
                  {mentor.image ? (
                    <img src={`/${mentor.image}`} alt={mentor.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                      <User className="h-8 w-8 text-accent" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{mentor.name}</h3>
                    <p className="text-sm text-accent">{mentor.title}</p>
                  </div>
                </div>
                {mentor.specialization && (
                  <p className="text-sm text-muted-foreground mb-3">{mentor.specialization}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{mentor.experience} years exp.</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{mentor.rating}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MentorsDashboard;