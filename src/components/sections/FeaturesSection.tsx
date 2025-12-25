import { motion } from "framer-motion";
import { Briefcase, Users, Calendar, Award, ArrowRight, Building2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Briefcase,
    title: "Internship Opportunities",
    description: "Access hundreds of curated internship positions from top companies across various industries.",
    color: "accent",
  },
  {
    icon: Users,
    title: "Expert Counsellors",
    description: "Get personalized guidance from industry professionals who understand your career aspirations.",
    color: "primary",
  },
  {
    icon: Calendar,
    title: "Easy Booking",
    description: "Schedule counselling sessions and apply for internships with our streamlined booking system.",
    color: "accent",
  },
  {
    icon: Award,
    title: "Career Growth",
    description: "Build essential skills and gain valuable experience to accelerate your professional journey.",
    color: "primary",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export const FeaturesSection = () => {
  return (
    <section id="internships" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="text-accent">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We bridge the gap between students and industry, providing the resources and support you need to land your dream internship.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative bg-card rounded-2xl p-6 lg:p-8 shadow-soft hover:shadow-elevated transition-all duration-300 border border-border/50 hover:border-accent/30"
            >
              <div
                className={`w-14 h-14 rounded-xl ${
                  feature.color === "accent" ? "bg-accent/10" : "bg-primary/10"
                } flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon
                  className={`w-7 h-7 ${
                    feature.color === "accent" ? "text-accent" : "text-primary"
                  }`}
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
              
              {/* Hover decoration */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mt-16">
          {/* Internships CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl gradient-hero p-8 lg:p-10"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-8 h-8 text-accent" />
                <span className="text-primary-foreground/70 font-medium">Internship Portal</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-4">
                Find Your Perfect Internship
              </h3>
              <p className="text-primary-foreground/80 mb-6 max-w-md">
                Browse through 500+ internship opportunities from leading companies. Filter by industry, location, and duration.
              </p>
              <Button variant="hero" size="lg">
                Explore Internships
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
          </motion.div>

          {/* Counselling CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-secondary p-8 lg:p-10 border border-border"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
                <span className="text-muted-foreground font-medium">Career Counselling</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Get Expert Guidance
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Book one-on-one sessions with experienced counsellors who will help you navigate your career path.
              </p>
              <Button variant="default" size="lg">
                Book a Session
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
