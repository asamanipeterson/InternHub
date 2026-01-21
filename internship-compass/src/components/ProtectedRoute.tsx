// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import auth from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  adminOnly?: boolean;
  mentorOnly?: boolean;
  industryAdminOnly?: boolean;
  children?: React.ReactNode;
}

const ProtectedRoute = ({
  adminOnly = false,
  mentorOnly = false,
  industryAdminOnly = false,
  children,
}: ProtectedRouteProps) => {
  const isLocallyAuthenticated = auth.isAuthenticated();

  const getLocalUser = () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "null" || stored === "undefined") return null;
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
    staleTime: 5 * 60 * 1000,
  });

  if (!isLocallyAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading && !localUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const user = serverUser || localUser;

  if (!user || isError) {
    localStorage.removeItem("user");
    toast.error("Session expired. Please sign in again.");
    return <Navigate to="/auth" replace />;
  }

  const userType = user?.user_type?.toString().toLowerCase().trim() || "";

  // Role-based access
  if (adminOnly && userType !== "admin") {
    toast.error("Super admin access only");
    return <Navigate to="/" replace />;
  }

  if (mentorOnly && userType !== "mentor") {
    toast.error("Mentor access only");
    return <Navigate to="/" replace />;
  }

  if (industryAdminOnly && userType !== "industry_admin") {
    toast.error("Industry admin access only");
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;