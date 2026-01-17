'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Shield, UserCircle, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const [isOpen, setIsOpen] = useState(false);           // mobile menu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // user dropdown
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    const handleUpdate = () => loadUser();
    window.addEventListener("userUpdated", handleUpdate);

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("userUpdated", handleUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Role checks - precise & case-insensitive
  const userType = user?.user_type?.toString().toLowerCase().trim();
  const isAdmin = userType === "admin";
  const isMentor = userType === "mentor";
  const isStudent = userType === "student" || userType === "user"; // Check for both
  const isLoggedIn = !!user;
  const isOnAuthPage = location.pathname === "/auth";

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
    setIsOpen(false);
    setIsDropdownOpen(false);
    navigate("/auth");
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  // Updated fallback logic: Use "Student" instead of "User"
  const userName = user?.name || user?.email?.split('@')[0] || "Student";
  const userRoleDisplay = isAdmin ? "Administrator" : isMentor ? "Mentor" : "Student";

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

          {/* Desktop Nav Links */}
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
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            {!isLoggedIn && !isOnAuthPage && (
              <Link to="/auth">
                <Button variant="accent">Register</Button>
              </Link>
            )}

            {isLoggedIn && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <UserCircle className="h-8 w-8 text-primary" />
                  <span className="font-medium text-sm hidden md:block">
                    {userName}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isDropdownOpen ? "rotate-180" : ""
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <div className="py-2">
                        {/* Username header */}
                        <div className="px-4 py-3 border-b border-border">
                          <p className="font-medium">{userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {userRoleDisplay}
                          </p>
                        </div>

                        {/* Admin: Dashboard */}
                        {isAdmin && (
                          <Link
                            to="/dashboard"
                            className="flex items-center px-4 py-3 hover:bg-secondary transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Shield className="h-5 w-5 mr-3 text-primary" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        {/* Mentor: Dashboard */}
                        {isMentor && (
                          <Link
                            to="/mentor/dashboard"
                            className="flex items-center px-4 py-3 hover:bg-secondary transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Shield className="h-5 w-5 mr-3 text-primary" />
                            <span>Mentor Dashboard</span>
                          </Link>
                        )}

                        {/* Logout */}
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-3 hover:bg-destructive/10 transition-colors text-destructive"
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass border-t border-border"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
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
                      "block font-medium py-3 px-4 rounded-lg transition-all",
                      isActive(link.href)
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Auth Controls */}
              <div className="pt-6 space-y-4 border-t border-border">
                {isLoggedIn ? (
                  <>
                    {/* User Info */}
                    <div className="px-4 py-3 bg-secondary/50 rounded-lg">
                      <p className="font-medium">{userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {userRoleDisplay}
                      </p>
                    </div>

                    {/* Admin: Dashboard */}
                    {isAdmin && (
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}

                    {/* Mentor: Dashboard */}
                    {isMentor && (
                      <Link to="/mentor/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <Shield className="w-4 h-4 mr-2" />
                          Mentor Dashboard
                        </Button>
                      </Link>
                    )}

                    {/* Logout */}
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  !isOnAuthPage && (
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="accent" className="w-full">
                        Register
                      </Button>
                    </Link>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};