// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner"; // This is the custom one we're styling
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      
      {/* Custom Styled Sonner Toasts */}
      <Sonner
        position="top-right"
        closeButton
        richColors
        expand={false}
        duration={4000}
        toastOptions={{
          classNames: {
            toast:
              "group toast flex items-center gap-4 rounded-xl shadow-2xl border-0 px-6 py-4 min-w-[340px] backdrop-blur-md animate-in slide-in-from-right-full duration-500",
            title: "font-bold text-md",
            description: "text-sm opacity-90 mt-1",
            success: "bg-green-600 text-white border-green-700",
            error: "bg-red-600 text-white border-red-700",
            info: "bg-blue-600 text-white",
            warning: "bg-amber-600 text-white",
            closeButton:
              "bg-white/20 hover:bg-white/30 text-white border-0 rounded-full w-8 h-8",
            actionButton: "bg-white text-green-600 hover:bg-gray-100 font-medium",
            cancelButton: "bg-transparent text-white/70 hover:text-white",
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

          {/* Auth Page */}
          <Route path="/auth" element={<Auth />} />

          {/* Protected Admin Dashboard */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/booked-slots" element={<BookedSlots />} />
            <Route path="/companies-dashboard" element={<CompaniesDashboard />} />
            <Route path="/pending-applications" element={<PendingApplications />} />
            <Route path="/mentors-dashboard" element={<MentorsDashboard />} />
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;