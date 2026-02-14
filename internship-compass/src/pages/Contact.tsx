import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24-48 hours.",
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section - Updated with About page gradient and blobs */}
      <section className="relative pt-32 pb-20 gradient-hero overflow-hidden">
        {/* Animated Background Blobs */}
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
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground font-medium text-sm mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Get In Touch
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6"
            >
              Contact{" "}
              <span className="relative inline-block">
                <span className="text-accent">Us</span>
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
              className="text-lg lg:text-xl text-primary-foreground/80 max-w-2xl mx-auto"
            >
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card rounded-2xl p-8 shadow-elegant border border-border"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="bg-background"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className="bg-background"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    className="bg-background"
                    required
                  />
                </div>
                
                <Button type="submit" size="lg" className="w-full shadow-elegant" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Contact Information</h2>
                <p className="text-muted-foreground text-lg">
                  Reach out to us through any of the following channels. We're here to help!
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Mail, title: "Email Us", content: "hello@studentindustryconnect.com", href: "mailto:hello@studentindustryconnect.com" },
                  { icon: Phone, title: "Call Us", content: "+1 (234) 567-890", href: "tel:+1234567890" },
                  { icon: MapPin, title: "Visit Us", content: "123 Innovation Street, Tech City" },
                  { icon: Clock, title: "Business Hours", content: "Monday - Friday: 9:00 AM - 6:00 PM" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      {item.href ? (
                        <a href={item.href} className="text-muted-foreground hover:text-accent transition-colors">
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">{item.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;