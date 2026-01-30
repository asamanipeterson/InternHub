import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { ArrowRight, Briefcase, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const CountUpStat = ({ end, suffix, label }: { end: number; suffix: string; label: string }) => {
  const countValue = useMotionValue(0);
  const rounded = useTransform(countValue, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(countValue, end, {
      duration: 2.5,
      ease: "easeOut",
      delay: 1,
    });
    return controls.stop;
  }, [countValue, end]);

  return (
    <div className="text-center lg:text-left">
      <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-accent">
        <motion.span>{rounded}</motion.span>{suffix}
      </div>
      <div className="text-primary-foreground/70 text-xs md:text-sm">{label}</div>
    </div>
  );
};

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden py-16 lg:py-0">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="Professional team collaboration" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/85" />
      </div>

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-accent/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-[5%] w-80 h-80 rounded-full bg-accent/5 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Content (Title, Buttons, and Stats) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium">Start Your Career Journey</span>
            </motion.div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Connect with{" "}
              <span className="relative inline-block">
                <span className="text-accent">Industry Leaders</span>
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-1 bg-accent rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                />
              </span>
              <br />
              & Launch Your Career
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0">
              Discover exclusive internship opportunities and  get one-on-one sessions with experienced mentors who will  help you navigate your career path.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/internships">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Browse Internships
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/mentorship">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  Career Mentorship
                </Button>
              </Link>
            </div>

            {/* Stats - Stays above the visual on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap justify-center lg:justify-start gap-6 md:gap-8 mt-12 pt-8 border-t border-primary-foreground/20"
            >
              <CountUpStat end={500} suffix="+" label="Internships" />
              <CountUpStat end={50} suffix="+" label="Companies" />
              <CountUpStat end={10000} suffix="+" label="Students Placed" />
            </motion.div>
          </motion.div>

          {/* Right Visual - Now appears AFTER stats on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mt-16 lg:mt-0"
          >
            <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[350px] md:max-w-md lg:max-w-lg mx-auto">
              
              {/* Central spinning circle - Original Color Maintained */}
              <motion.div
                className="absolute inset-10 md:inset-12 rounded-full bg-gradient-to-br from-accent/40 to-accent/10 backdrop-blur-sm border border-accent/30 shadow-[0_0_40px_rgba(var(--accent),0.2)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />

              {/* Floating Glassy Cards */}
              <motion.div
                className="absolute top-0 left-[-8%] z-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 md:p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent/30 flex items-center justify-center border border-white/10">
                    <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                  </div>
                  <div className="pr-2">
                    <div className="font-semibold text-white text-xs md:text-base">Tech Internships</div>
                    <div className="text-[10px] md:text-xs text-white/70">120+ Positions</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute top-1/4 right-[-8%] z-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 md:p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/40 flex items-center justify-center border border-white/10">
                    <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="pr-2">
                    <div className="font-semibold text-white text-xs md:text-base">Career Guidance</div>
                    <div className="text-[10px] md:text-xs text-white/70">Expert Mentors</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-10 left-[2%] z-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 md:p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent/30 flex items-center justify-center border border-white/10">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                  </div>
                  <div className="pr-2">
                    <div className="font-semibold text-white text-xs md:text-base">Join 10K+ Students</div>
                    <div className="text-[10px] md:text-xs text-white/70">Growing Community</div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative dots */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full bg-accent/40"
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};