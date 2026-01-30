import { motion } from "framer-motion";
import { UserPlus, Search, CalendarCheck, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up and build your student profile with your skills, interests, and career goals.",
  },
  {
    number: "02",
    icon: Search,
    title: "Explore Opportunities",
    description: "Browse through internship listings or find the right mentor for your needs.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Apply or Book",
    description: "Submit your applications or schedule Mentorship sessions with just a few clicks.",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Launch Your Career",
    description: "Get matched, receive guidance, and take the first steps toward your dream career.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="counselling" className="py-20 lg:py-32 bg-secondary/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How It <span className="text-accent">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in minutes and begin your journey to career success with our straightforward process.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Step number circle */}
                <motion.div
                  className="relative w-20 h-20 mx-auto mb-6"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 rounded-full bg-accent/20 animate-pulse" />
                  <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center shadow-soft">
                    <step.icon className="w-8 h-8 text-accent" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.number}
                  </div>
                </motion.div>

                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
