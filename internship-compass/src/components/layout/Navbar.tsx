// src/components/layout/Navbar.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import auth from "@/lib/auth";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Internships", href: "/internships" },
  { label: "Mentorship", href: "/mentorship" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  const loadUser = () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "null" || stored === "undefined") {
        setUser(null);
      } else {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (error) {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    const handleUpdate = () => {
      loadUser();
    };

    window.addEventListener("userUpdated", handleUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUpdate);
    };
  }, []);

  const isAdmin = user?.user_type?.toString().toLowerCase().trim() === "admin";
  const isLoggedIn = !!user;

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
    setIsOpen(false);
    window.location.href = "/auth";
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Student Industry Connect" className="h-10 lg:h-12 w-auto" />
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all duration-300",
                  isActive(link.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/80 hover:text-foreground hover:bg-primary/10"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Dashboard placed in main nav for admins, close to logout */}
            {isAdmin && (
              <Link
                to="/dashboard"
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center",
                  isActive("/dashboard")
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/80 hover:text-foreground hover:bg-primary/10"
                )}
              >
                <Shield className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side: Logout (and Get Started for non-admins) */}
          <div className="hidden lg:flex items-center gap-3">
            {isAdmin && (
              <Button variant="destructive" size="default" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}

            {(!isLoggedIn || !isAdmin) && (
              <Link to="/internships">
                <Button variant="accent">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      "block font-medium py-2 px-4 rounded-lg transition-all duration-300",
                      isActive(link.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground/80 hover:text-foreground hover:bg-secondary"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                >
                  <Link
                    to="/dashboard"
                    className={cn(
                      "block font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center",
                      isActive("/dashboard")
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground/80 hover:text-foreground hover:bg-secondary"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </motion.div>
              )}

              <div className="pt-4 space-y-3 border-t border-border">
                {isAdmin && (
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                )}

                {(!isLoggedIn || !isAdmin) && (
                  <Link to="/internships" onClick={() => setIsOpen(false)}>
                    <Button variant="accent" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};