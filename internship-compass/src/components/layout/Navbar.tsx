'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Shield, UserCircle, ChevronDown, Bell } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import api from "@/lib/api";
import auth from "@/lib/auth";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Internships", href: "/internships" },
  { label: "Mentorship", href: "/mentorship" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const REFRESH_INTERVAL = 25000;

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

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

  // Fetch real notification count
  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/api/notifications/count");
        setNotificationCount(res.data.unread || 0);
      } catch (err: any) {
        console.error("Failed to fetch notifications:", err);
        // Optional: toast.error("Couldn't load notifications");
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [user]);

  const userType = user?.user_type?.toString().toLowerCase().trim() || "";
  const isAdmin = userType === "admin";
  const isMentor = userType === "mentor";
  const isIndustryAdmin = userType === "industry_admin";
  const isStudent = userType === "student" || userType === "user";
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

  const userName = user?.name || user?.email?.split('@')[0] || "User";
  const userRoleDisplay = isAdmin
    ? "Administrator"
    : isMentor
    ? "Mentor"
    : isIndustryAdmin
    ? "Industry Admin"
    : "Student";

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
          <div className="hidden lg:flex items-center gap-5">
            {!isLoggedIn && !isOnAuthPage && (
              <Link to="/auth">
                <Button variant="accent">Register</Button>
              </Link>
            )}

            {isLoggedIn && (
              <>
                {/* Notification Bell */}
                <button
                  className="relative p-2 rounded-full hover:bg-secondary/70 transition-colors"
                  onClick={() => {
                    toast.info("Notifications panel coming soon!");
                    // Later: navigate("/notifications") or open dropdown
                  }}
                >
                  <Bell className="h-6 w-6 text-foreground" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    <UserCircle className="h-8 w-8 text-primary" />
                    <span className="font-medium text-sm hidden md:block">{userName}</span>
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", isDropdownOpen ? "rotate-180" : "")}
                    />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
                      >
                        <div className="py-2">
                          <div className="px-4 py-3 border-b border-border">
                            <p className="font-medium">{userName}</p>
                            <p className="text-xs text-muted-foreground">{userRoleDisplay}</p>
                          </div>

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

                          {isIndustryAdmin && (
                            <Link
                              to="/industry-admin/dashboard"
                              className="flex items-center px-4 py-3 hover:bg-secondary transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <Shield className="h-5 w-5 mr-3 text-primary" />
                              <span>Industry Admin</span>
                            </Link>
                          )}

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
              </>
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

              <div className="pt-6 space-y-4 border-t border-border">
                {isLoggedIn ? (
                  <>
                    {/* Mobile Notification Bell */}
                    <button
                      className="relative flex items-center justify-center w-full py-3 px-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                      onClick={() => {
                        toast.info("Notifications panel coming soon!");
                      }}
                    >
                      <Bell className="h-5 w-5 mr-2" />
                      <span>Notifications</span>
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 right-4 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                      )}
                    </button>

                    <div className="px-4 py-3 bg-secondary/50 rounded-lg">
                      <p className="font-medium">{userName}</p>
                      <p className="text-sm text-muted-foreground">{userRoleDisplay}</p>
                    </div>

                    {isAdmin && (
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}

                    {isIndustryAdmin && (
                      <Link to="/industry-admin/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <Shield className="w-4 h-4 mr-2" />
                          Industry Admin
                        </Button>
                      </Link>
                    )}

                    {isMentor && (
                      <Link to="/mentor/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <Shield className="w-4 h-4 mr-2" />
                          Mentor Dashboard
                        </Button>
                      </Link>
                    )}

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