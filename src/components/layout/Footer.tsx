import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";

const footerLinks = {
  platform: [
    { label: "Internships", href: "#internships" },
    { label: "Counselling", href: "#counselling" },
    { label: "Companies", href: "#" },
    { label: "Students", href: "#" },
  ],
  resources: [
    { label: "Blog", href: "#" },
    { label: "Career Tips", href: "#" },
    { label: "Resume Builder", href: "#" },
    { label: "Interview Prep", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Partner With Us", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img src={logo} alt="Student Industry Connect" className="h-12 w-auto mb-4 brightness-0 invert" />
              <p className="text-primary-foreground/70 mb-6 max-w-sm">
                Connecting students with industry opportunities. Your gateway to internships and career guidance.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <a href="mailto:hello@studentindustryconnect.com" className="flex items-center gap-3 text-primary-foreground/70 hover:text-accent transition-colors">
                  <Mail className="w-5 h-5" />
                  <span>hello@studentindustryconnect.com</span>
                </a>
                <a href="tel:+1234567890" className="flex items-center gap-3 text-primary-foreground/70 hover:text-accent transition-colors">
                  <Phone className="w-5 h-5" />
                  <span>+1 (234) 567-890</span>
                </a>
                <div className="flex items-center gap-3 text-primary-foreground/70">
                  <MapPin className="w-5 h-5" />
                  <span>123 Innovation Street, Tech City</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <h4 className="font-semibold text-lg mb-4 capitalize">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-primary-foreground/70 hover:text-accent transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} Student Industry Connect. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-110"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
