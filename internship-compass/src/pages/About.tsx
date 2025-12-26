import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Target, Heart, Users, Award, ArrowRight, CheckCircle, Lightbulb, Handshake } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const stats = [
    { value: "500+", label: "Internships Offered" },
    { value: "50+", label: "Partner Companies" },
    { value: "10K+", label: "Students Placed" },
    { value: "95%", label: "Success Rate" },
  ];

  const values = [
    { icon: Target, title: "Mission-Driven", description: "Empowering students to launch successful careers through meaningful internship experiences." },
    { icon: Heart, title: "Student-Centric", description: "Every decision we make puts student success and growth at the forefront." },
    { icon: Lightbulb, title: "Innovation", description: "Continuously improving our platform to better serve students and employers." },
    { icon: Handshake, title: "Partnership", description: "Building lasting relationships between students, educators, and industry leaders." },
  ];

  const team = [
    { name: "Dr. Sarah Johnson", role: "Founder & CEO", emoji: "👩‍💼", bio: "20+ years in education and career development" },
    { name: "Michael Chen", role: "Head of Partnerships", emoji: "👨‍💻", bio: "Former HR Director at Fortune 500 companies" },
    { name: "Emily Rodriguez", role: "Student Success Lead", emoji: "👩‍🎓", bio: "Dedicated to helping students achieve their dreams" },
    { name: "David Okonkwo", role: "Industry Relations", emoji: "👨‍💼", bio: "Connecting top talent with leading organizations" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 gradient-hero relative overflow-hidden">
        <motion.div
          className="absolute top-20 left-[10%] w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 right-[5%] w-72 h-72 rounded-full bg-primary/20 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Our Story
            </motion.span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Bridging the Gap Between{" "}
              <span className="relative inline-block">
                <span className="text-accent">Students</span>
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-1 bg-accent rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />
              </span>{" "}
              and{" "}
              <span className="relative inline-block">
                <span className="text-accent">Industry</span>
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-1 bg-accent rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                />
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              We're on a mission to transform how students discover and secure meaningful internship opportunities that launch their careers.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/internships">
                <Button variant="hero" size="xl">
                  Browse Opportunities
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/mentorship">
                <Button variant="hero-outline" size="xl">
                  Meet Our Counselors
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-accent mb-2"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why We <span className="text-accent">Exist</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                We believe every student deserves access to quality internship opportunities that align with their career aspirations. Too often, talented students miss out on opportunities simply because they don't know where to look or how to stand out.
              </p>
              <p className="text-muted-foreground text-lg mb-8">
                Student Industry Connect was founded to solve this problem—connecting ambitious students with leading companies and providing the guidance they need to succeed.
              </p>
              
              <div className="space-y-4">
                {[
                  "Curated internship opportunities from verified employers",
                  "Expert career counseling and guidance",
                  "Seamless application and booking process",
                  "Ongoing support throughout your internship journey",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-card p-6 rounded-2xl shadow-elegant border border-border/50"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our <span className="text-accent">Leadership</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A dedicated team committed to student success and industry excellence
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-card rounded-2xl p-6 text-center shadow-elegant hover:shadow-elevated transition-all duration-300"
              >
                <motion.div
                  className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-4xl">{member.emoji}</span>
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
                <p className="text-accent font-medium text-sm mb-2">{member.role}</p>
                <p className="text-muted-foreground text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-accent/10"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of students who have launched their careers through our platform.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/internships">
                  <Button variant="hero" size="xl">
                    Explore Internships
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;