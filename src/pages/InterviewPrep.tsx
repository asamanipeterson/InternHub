import { motion } from "framer-motion";
import { MessageSquare, Video, Users, Brain, CheckCircle, BookOpen } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const resources = [
  {
    icon: MessageSquare,
    title: "Common Interview Questions",
    description: "Practice with the most frequently asked questions and learn how to craft compelling answers.",
    items: ["Tell me about yourself", "Why do you want this role?", "What are your strengths and weaknesses?"],
  },
  {
    icon: Video,
    title: "Mock Interviews",
    description: "Schedule practice interviews with industry professionals to build confidence.",
    items: ["One-on-one sessions", "Video call practice", "Detailed feedback"],
  },
  {
    icon: Brain,
    title: "Technical Preparation",
    description: "Prepare for technical interviews with coding challenges and case studies.",
    items: ["Coding exercises", "System design questions", "Problem-solving scenarios"],
  },
  {
    icon: Users,
    title: "Behavioral Interviews",
    description: "Master the STAR method and learn to showcase your experiences effectively.",
    items: ["STAR method examples", "Leadership questions", "Conflict resolution scenarios"],
  },
];

const tips = [
  "Research the company thoroughly before the interview",
  "Prepare specific examples using the STAR method",
  "Practice your answers out loud, not just in your head",
  "Prepare thoughtful questions to ask the interviewer",
  "Dress professionally and arrive early",
  "Follow up with a thank-you email within 24 hours",
];

const InterviewPrep = () => {
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
              Interview Resources
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4"
            >
              Interview{" "}
              <span className="relative inline-block">
                <span className="text-accent">Prep</span>
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
              className="text-lg text-primary-foreground/80 mb-8"
            >
              Ace your next interview with comprehensive preparation resources and expert guidance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link to="/mentorship">
                <Button size="lg" variant="accent">
                  <Video className="w-5 h-5 mr-2" />
                  Schedule Mock Interview
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Preparation Resources</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to prepare for your interviews and land your dream job.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <resource.icon className="w-7 h-7 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">{resource.title}</h3>
                    <p className="text-muted-foreground mb-4">{resource.description}</p>
                    <ul className="space-y-2">
                      {resource.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">Interview Day Tips</h2>
              <p className="text-muted-foreground mb-8">
                Follow these essential tips to make a great impression on interview day.
              </p>
              
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <motion.div
                    key={tip}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="flex items-start gap-3"
                  >
                    <BookOpen className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{tip}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card p-8 rounded-2xl border border-border"
            >
              <h3 className="text-2xl font-bold text-foreground mb-4">Practice Makes Perfect</h3>
              <p className="text-muted-foreground mb-6">
                Get personalized interview coaching from experienced professionals in your field.
              </p>
              <div className="space-y-4">
                <Link to="/mentorship" className="block">
                  <Button className="w-full" size="lg">
                    Find an Interview Coach
                  </Button>
                </Link>
                <Link to="/career-tips" className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    More Career Resources
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InterviewPrep;
