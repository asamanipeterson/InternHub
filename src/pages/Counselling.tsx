import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useBookingStore } from "@/stores/bookingStore";
import { Button } from "@/components/ui/button";
import { Star, Award, Clock, Mail, Phone, Calendar } from "lucide-react";

const Counselling = () => {
  const { counselors } = useBookingStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 gradient-hero relative overflow-hidden">
        <motion.div
          className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-accent/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Expert Guidance
            </motion.span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Our Distinguished{" "}
              <span className="text-accent">Counselors</span>
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Meet our team of experienced professionals dedicated to guiding your career journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Counselors Grid */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {counselors.map((counselor, index) => (
              <motion.div
                key={counselor.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="bg-card rounded-2xl overflow-hidden shadow-elegant hover:shadow-elevated transition-all duration-500">
                  {/* Image/Avatar Section */}
                  <div className="relative h-48 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-accent/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="text-7xl relative z-10">{counselor.image}</span>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {counselor.name}
                        </h3>
                        <p className="text-accent font-medium">{counselor.title}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-accent/10 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="text-sm font-semibold text-accent">{counselor.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-primary" />
                        {counselor.specialization}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-primary" />
                        {counselor.experience}+ years
                      </span>
                    </div>

                    <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                      {counselor.bio}
                    </p>

                    <div className="flex gap-3">
                      <Button variant="accent" size="sm" className="flex-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Session
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Counseling <span className="text-accent">Services</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive career guidance to help you succeed
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: "🎯", title: "Career Planning", description: "Personalized guidance to help you identify and pursue the right career path." },
              { icon: "📝", title: "Resume Review", description: "Expert feedback to make your resume stand out to potential employers." },
              { icon: "💬", title: "Interview Prep", description: "Mock interviews and coaching to boost your confidence and skills." },
              { icon: "🔍", title: "Industry Insights", description: "Deep knowledge of various industries and what employers are looking for." },
              { icon: "🤝", title: "Networking Tips", description: "Strategies to build meaningful professional connections." },
              { icon: "📊", title: "Skill Assessment", description: "Identify your strengths and areas for development." },
            ].map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-card p-6 rounded-2xl shadow-elegant hover:shadow-elevated transition-all duration-300 border border-border/50"
              >
                <motion.span
                  className="text-4xl block mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {service.icon}
                </motion.span>
                <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Counselling;