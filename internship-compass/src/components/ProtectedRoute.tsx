// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import auth from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  adminOnly?: boolean;
  mentorOnly?: boolean;
  children?: React.ReactNode;
}

const ProtectedRoute = ({
  adminOnly = false,
  mentorOnly = false,
  children,
}: ProtectedRouteProps) => {
  const isLocallyAuthenticated = auth.isAuthenticated();

  // === SAFELY GET USER FROM LOCALSTORAGE (same pattern as Navbar) ===
  const getLocalUser = () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "null" || stored === "undefined") {
        return null;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.warn("Corrupted user data in localStorage – clearing it", error);
      localStorage.removeItem("user");
      return null;
    }
  };

  const localUser = getLocalUser();

  const { data: serverUser, isLoading, isError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: auth.getMe,
    enabled: isLocallyAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Not authenticated at all → redirect to login
  if (!isLocallyAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Still loading user from server, but we have local fallback
  if (isLoading && !localUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Use server data if available, otherwise fallback to local
  const user = serverUser || localUser;

  // If no user object at all or server returned error → treat as not authenticated
  if (!user || isError) {
    localStorage.removeItem("user");
    toast.error("Session expired. Please sign in again.");
    return <Navigate to="/auth" replace />;
  }

  const userType = user?.user_type?.toString().toLowerCase().trim() || "";

  // Role checks
  if (adminOnly && userType !== "admin") {
    toast.error("Admin access only");
    return <Navigate to="/" replace />;
  }

  if (mentorOnly && userType !== "mentor") {
    toast.error("Mentor access only");
    return <Navigate to="/" replace />;
  }

  // All good → render the protected content
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;