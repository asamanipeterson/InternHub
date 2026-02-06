// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Internships from "./pages/Internships";
import Mentorship from "./pages/Mentorship";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import Companies from "./pages/Companies";
import BookedSlots from "./pages/BookedSlots";
import CompaniesDashboard from "./pages/CompaniesDashboard";
import PendingApplications from "./pages/PendingApplications";
import MentorsDashboard from "./pages/MentorsDashboard";
import Students from "./pages/Students";
import Blog from "./pages/Blog";
import CareerTips from "./pages/CareerTips";
import ResumeBuilder from "./pages/ResumeBuilder";
import InterviewPrep from "./pages/InterviewPrep";
import Careers from "./pages/Careers";
import PartnerWithUs from "./pages/PartnerWithUs";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import MentorProfile from "./pages/MentorProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import BookedMentorship from "./pages/BookedMentorship";
import AdminMentorshipBookings from "./pages/AdminMentorshipBookings";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import MentorDashboard from "./pages/MentorDashboard";
import SetMentorPassword from "./pages/SetMentorPassword";
import SetPassword from "./pages/SetPassword";
import IndustryAdminDashboard from "./pages/IndustryAdminDashboard";
import AnalyticsPage from "./pages/admin/Analytics";
import StudentDashboard from "./pages/StudentDashboard";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      
      {/* Custom Styled Sonner Toasts */}
      <Sonner
        position="top-center"
        closeButton
        richColors
        expand={false}
        duration={10000}
        visibleToasts={1}
        toastOptions={{
          duration: 15000,
          classNames: {
            toast:
              "group toast flex items-center gap-5 rounded-2xl shadow-2xl border-0 px-7 py-5 min-w-[380px] max-w-[90vw] md:min-w-[420px] backdrop-blur-xl text-base",
            title: "font-semibold text-lg leading-tight",
            description: "text-base opacity-90 mt-1.5 leading-relaxed",
            icon: "text-2xl",
            loader: "scale-125",
            closeButton:
              "absolute right-3 top-3.5 bg-white/15 hover:bg-white/25 text-white border-0 rounded-full w-9 h-9 flex items-center justify-center transition-colors",
            success: "bg-emerald-700/95 border-emerald-600/70 text-white",
            error: "bg-red-700/95 border-red-600/70 text-white",
            warning: "bg-amber-700/95 border-amber-600/70 text-white",
            info: "bg-blue-700/95 border-blue-600/70 text-white",
          },
        }}
      />

      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/mentorship/mentor/:uuid" element={<MentorProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/students" element={<Students />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/career-tips" element={<CareerTips />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/partner-with-us" element={<PartnerWithUs />} />
          <Route path="/mentorship/booked" element={<BookedMentorship />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/set-mentor-password" element={<SetMentorPassword />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/auth" element={<Auth />} />

            <Route path="/mentor/auth/" element={<Auth />} />
           <Route path="/admin/auth/" element={<Auth />} />
            <Route path="/industryadmin/auth/" element={<Auth />} />
            <Route path="/student/dashboard" element={<StudentDashboard/>} />
          {/* Protected Admin Dashboard Routes */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/booked-slots" element={<BookedSlots />} />
            <Route path="/companies-dashboard" element={<CompaniesDashboard />} />
            <Route path="/pending-applications" element={<PendingApplications />} />
            <Route path="/mentors-dashboard" element={<MentorsDashboard />} />
            <Route path="/admin/mentorship-bookings" element={<AdminMentorshipBookings />} />
            <Route path="/admin/analyticspage" element={<AnalyticsPage/>}/>
          </Route>

          {/* Protected Mentor Routes */}
          <Route element={<ProtectedRoute mentorOnly={true} />}>
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          </Route>

          <Route
  path="/industry-admin/dashboard"
  element={
    <ProtectedRoute industryAdminOnly={true}>
      <IndustryAdminDashboard />
    </ProtectedRoute>
  }
/>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;