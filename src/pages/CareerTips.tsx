import { motion } from "framer-motion";
import { Lightbulb, Target, Users, TrendingUp, BookOpen, Award } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const tips = [
  {
    icon: Target,
    title: "Set Clear Goals",
    description: "Define your career objectives early. Having clear, measurable goals helps you stay focused and make informed decisions about opportunities.",
    tip: "Write down your 1-year, 5-year, and 10-year career goals and review them monthly.",
  },
  {
    icon: Users,
    title: "Build Your Network",
    description: "Networking is crucial for career success. Connect with professionals in your field, attend industry events, and maintain relationships.",
    tip: "Aim to make at least 3 new professional connections every month.",
  },
  {
    icon: BookOpen,
    title: "Never Stop Learning",
    description: "The job market evolves constantly. Stay relevant by continuously updating your skills and knowledge through courses and certifications.",
    tip: "Dedicate at least 5 hours per week to learning new skills related to your field.",
  },
  {
    icon: Lightbulb,
    title: "Develop Soft Skills",
    description: "Technical skills get you hired, but soft skills help you advance. Focus on communication, leadership, and emotional intelligence.",
    tip: "Practice public speaking and join groups like Toastmasters to improve communication.",
  },
  {
    icon: TrendingUp,
    title: "Seek Feedback",
    description: "Regular feedback helps you identify blind spots and areas for improvement. Don't wait for annual reviews—ask for feedback proactively.",
    tip: "After completing projects, ask colleagues and mentors for specific, actionable feedback.",
  },
  {
    icon: Award,
    title: "Document Your Wins",
    description: "Keep track of your achievements and contributions. This makes it easier to update your resume and negotiate raises or promotions.",
    tip: "Maintain a 'brag document' where you record accomplishments weekly.",
  },
];

const CareerTips = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-block px-4 py-2 rounded-full bg-accent/20 text-accent font-medium text-sm mb-6"
            >
              Career Development
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4"
            >
              Career{" "}
              <span className="relative inline-block">
                <span className="text-accent">Tips</span>
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
              className="text-lg text-primary-foreground/80"
            >
              Expert advice to help you navigate your career journey and achieve your professional goals.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                  <tip.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{tip.title}</h3>
                <p className="text-muted-foreground mb-4">{tip.description}</p>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm font-medium text-foreground">
                    <span className="text-accent">Pro Tip:</span> {tip.tip}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground mb-6">
              Want personalized career guidance?
            </p>
            <Link to="/mentorship">
              <Button size="lg">
                Connect with a Mentor
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareerTips;
