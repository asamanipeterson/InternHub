'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, UserCircle, ChevronDown, Bell } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import api from "@/lib/api";
import auth from "@/lib/auth";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Interview Prep", href: "/interview-prep" },
  { label: "Career Tips", href: "/career-tips" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const REFRESH_INTERVAL = 25000;

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load user & listen for updates
  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem("user");
        if (!stored || stored === "null" || stored === "undefined") {
          setUser(null);
        } else {
          setUser(JSON.parse(stored));
        }
      } catch {
        localStorage.removeItem("user");
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("userUpdated", loadUser);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("userUpdated", loadUser);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Notification count polling
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/api/notifications/count");
        setNotificationCount(res.data.unread || 0);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [user]);

  const userType = user?.user_type?.toString().toLowerCase().trim() || "";
  const isLoggedIn = !!user;

  const isAdmin = userType === "admin";
  const isMentor = userType === "mentor";
  const isIndustryAdmin = userType === "industry_admin";
  const isStudent = userType === "user";

  const userName = user?.first_name || user?.email?.split('@')[0] || "User";
  const userRoleDisplay = isAdmin
    ? "Administrator"
    : isMentor
    ? "Mentor"
    : isIndustryAdmin
    ? "Industry Admin"
    : "Student";

  const isDarkSection = !isScrolled;

  const dashboardLink = (() => {
    if (isAdmin) return { label: "Admin Dashboard", href: "/dashboard" };
    if (isMentor) return { label: "Mentor Dashboard", href: "/mentor/dashboard" };
    if (isIndustryAdmin) return { label: "Industry Dashboard", href: "/industry-admin/dashboard" };
    return null;
  })();

  const handleLogout = async () => {
    try {
      await auth.logout();

      setUser(null);
      setIsOpen(false);
      setIsDropdownOpen(false);

      // Role-based redirect
      if (isStudent) {
        navigate("/auth");
      } else if (isMentor) {
        navigate("/mentor/auth");
      } else if (isAdmin) {
        navigate("/admin/auth");
      } else if (isIndustryAdmin) {
        navigate("/industryadmin/auth");
      } else {
        navigate("/auth");
      }

      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed");
      navigate("/auth");
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  // ───────────────────────────────────────────────
  // URL normalizer for profile picture (fixes relative vs absolute URLs)
  const getProfilePicUrl = (path?: string) => {
    if (!path) return "/default-avatar.png";

    // Already a full URL
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // Laravel asset() style → starts with /storage/
    if (path.startsWith("/storage/")) {
      return `http://localhost:8000${path}`;
    }

    // Raw path from DB (most common inconsistency)
    return `http://localhost:8000/storage/${path}`;
  };
  // ───────────────────────────────────────────────

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isDarkSection
          ? "bg-transparent py-4"
          : "bg-white/80 backdrop-blur-xl border-b border-gray-200 py-2 shadow-sm"
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className={cn(
                "h-10 lg:h-12 w-auto transition-all duration-300",
                isDarkSection ? "brightness-0 invert scale-[1.03]" : "brightness-100"
              )}
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-2">
            {dashboardLink && (
              <Link
                to={dashboardLink.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300",
                  isActive(dashboardLink.href)
                    ? "bg-[#ff5722] text-white shadow-md"
                    : isDarkSection ? "text-white/90 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {dashboardLink.label}
              </Link>
            )}

            {!dashboardLink &&
              navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300",
                    isActive(link.href)
                      ? "bg-[#ff5722] text-white shadow-md"
                      : isDarkSection ? "text-white/90 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {link.label}
                </Link>
              ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-5">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <button
                  className={cn(
                    "relative p-2 transition-colors rounded-full",
                    isDarkSection ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-gray-700"
                  )}
                  onClick={() => toast.info("Notifications coming soon!")}
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 bg-[#ff5722] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                      isDarkSection ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-gray-800"
                    )}
                  >
                    <Avatar className="h-8 w-8 border border-accent/20">
                      <AvatarImage
                        src={getProfilePicUrl(user?.profile_picture)}
                        alt={userName}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        <UserCircle className={cn("h-8 w-8", isDarkSection ? "text-black" : "text-gray-600")} />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm hidden md:block">{userName}</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isDropdownOpen ? "rotate-180" : "")} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={cn(
                          "absolute right-0 mt-3 w-64 rounded-xl shadow-2xl overflow-hidden z-50",
                          isDarkSection ? "bg-black/80 backdrop-blur-xl border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-800"
                        )}
                      >
                        <div className="py-2">
                          <div className={cn("px-4 py-3 border-b flex items-center gap-3", isDarkSection ? "border-white/10" : "border-gray-100")}>
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={getProfilePicUrl(user?.profile_picture)}
                                alt={userName}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-accent font-bold">
                                {userName[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{userName}</p>
                              <p className={cn("text-xs", isDarkSection ? "text-white/70" : "text-gray-500")}>{userRoleDisplay}</p>
                            </div>
                          </div>

                          {isStudent && (
                            <Link
                              to="/student/dashboard"
                              className="block px-4 py-3 text-sm hover:bg-accent/10 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              Your Dashboard
                            </Link>
                          )}

                          <button
                            onClick={handleLogout}
                            className={cn(
                              "w-full flex items-center px-4 py-3 transition-colors text-left text-sm",
                              isDarkSection ? "hover:bg-red-900/30 text-red-300" : "hover:bg-red-50 text-red-600"
                            )}
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="accent">Register</Button>
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn("lg:hidden p-2 rounded-lg", isDarkSection ? "text-white" : "text-gray-800")}
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
            className={cn("lg:hidden border-t", isDarkSection ? "bg-black/90 border-white/10" : "bg-white border-gray-200")}
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-3 py-3 px-4 rounded-lg font-medium transition-colors",
                  location.pathname === "/"
                    ? "bg-[#ff5722] text-white"
                    : isDarkSection
                    ? "text-white hover:bg-white/10"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setIsOpen(false)}
              >
                <span>Home</span>
              </Link>

              {navLinks
                .filter((link) => link.href !== "/")
                .map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={cn(
                      "block py-3 px-4 rounded-lg font-medium transition-colors",
                      isActive(link.href)
                        ? "bg-[#ff5722] text-white"
                        : isDarkSection
                        ? "text-white hover:bg-white/10"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

              {isLoggedIn && (
                <>
                  <button
                    className={cn(
                      "flex items-center gap-3 w-full py-3 px-4 rounded-lg font-medium transition-colors",
                      notificationCount > 0
                        ? "text-[#ff5722] hover:bg-[#ff5722]/10"
                        : isDarkSection
                        ? "text-white hover:bg-white/10"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => toast.info("Notifications coming soon!")}
                  >
                    <div className="relative">
                      <Bell className="h-5 w-5" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#ff5722] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {notificationCount}
                        </span>
                      )}
                    </div>
                    <span>Notifications</span>
                  </button>

                  <div
                    className="flex items-center gap-3 px-4 py-3 border-t border-b"
                    style={{ borderColor: isDarkSection ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={getProfilePicUrl(user?.profile_picture)}
                        alt={userName}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {userName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className={cn("text-medium", isDarkSection ? "text-white/70" : "text-gray-500")}>{userName}</p>
                      <p className={cn("text-xs", isDarkSection ? "text-white/70" : "text-gray-500")}>
                        {userRoleDisplay}
                      </p>
                    </div>
                  </div>

                  {isStudent && (
                    <Link
                      to="/student/dashboard"
                      className={cn(
                        "block py-3 px-4 rounded-lg font-medium transition-colors",
                        isDarkSection ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      Your Dashboard
                    </Link>
                  )}

                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};