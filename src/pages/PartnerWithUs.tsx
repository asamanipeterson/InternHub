import { motion } from "framer-motion";
import { Handshake, Building2, GraduationCap, Award, CheckCircle, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const partnerTypes = [
  {
    icon: Building2,
    title: "Corporate Partners",
    description: "Partner with us to access top student talent and build your future workforce.",
    benefits: ["Access to verified student profiles", "Priority internship listings", "Campus recruitment support", "Employer branding opportunities"],
  },
  {
    icon: GraduationCap,
    title: "Educational Institutions",
    description: "Collaborate to provide your students with real-world experience and career opportunities.",
    benefits: ["Internship placement support", "Career fair participation", "Curriculum input", "Student mentorship programs"],
  },
  {
    icon: Award,
    title: "Industry Associations",
    description: "Work together to create industry-relevant programs and certifications.",
    benefits: ["Joint certification programs", "Industry insights sharing", "Networking events", "Research collaborations"],
  },
];

const stats = [
  { value: "500+", label: "Partner Companies" },
  { value: "100+", label: "Universities" },
  { value: "50,000+", label: "Students Placed" },
  { value: "95%", label: "Partner Satisfaction" },
];

const PartnerWithUs = () => {
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
              Partnership Opportunities
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4"
            >
              Partner{" "}
              <span className="relative inline-block">
                <span className="text-accent">With Us</span>
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
              Join our ecosystem of partners shaping the future of talent development and career opportunities.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link to="/contact">
                <Button size="lg" variant="accent">
                  <Handshake className="w-5 h-5 mr-2" />
                  Become a Partner
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-accent mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Partnership Opportunities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer various partnership models tailored to your organization's needs and goals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-6">
                  <type.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{type.title}</h3>
                <p className="text-muted-foreground mb-6">{type.description}</p>
                <ul className="space-y-3">
                  {type.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Partner?</h2>
            <p className="text-muted-foreground mb-8">
              Let's discuss how we can work together to create meaningful opportunities for students and build your future workforce.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg">
                  Contact Our Team
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/companies">
                <Button variant="outline" size="lg">
                  Learn More About Companies
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartnerWithUs;
