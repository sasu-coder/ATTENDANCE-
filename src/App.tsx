import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AttendanceProvider } from "@/hooks/useAttendanceStore";
import Chatbot from "@/components/Chatbot";
import DynamicNotifications from "@/components/DynamicNotifications";
import Index from "./pages/Index";
import Hero from "./pages/Hero";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import StudentPortal from "./pages/StudentPortal";
import LecturerDashboard from "./pages/LecturerDashboard";
import LecturerPortal from "./pages/LecturerPortal";
import AdminDashboard from "./pages/AdminDashboard";
import MessagingCenter from "./pages/MessagingCenter";
import Courses from "./pages/Courses";
import Attendance from "./pages/Attendance";
import Schedule from "./pages/Schedule";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import AdminPortal from "./pages/AdminPortal";
import LecturerChat from "./pages/LecturerChat";
import StudentAttendance from "./pages/StudentAttendance";
import Support from "./pages/Support";
import AdminCourseManagement from "./pages/AdminCourseManagement";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSystemLogs from "./pages/AdminSystemLogs";
import AttendanceViewer from "./pages/AttendanceViewer";
import GpsHeatmap from "./pages/GpsHeatmap";
import Settings from "./pages/Settings";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppInner = () => {
  const location = useLocation();
  return (
    <>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/home" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/student-portal" element={<StudentPortal />} />
        <Route path="/student-attendance" element={<StudentAttendance />} />
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/lecturer-portal" element={<LecturerPortal />} />
        <Route path="/lecturer-chat" element={<LecturerChat />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-portal" element={<AdminPortal />} />
        <Route path="/admin-courses" element={<AdminCourseManagement />} />
        <Route path="/admin-analytics" element={<AdminAnalytics />} />
        <Route path="/admin-logs" element={<AdminSystemLogs />} />
        <Route path="/messaging" element={<MessagingCenter />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/support" element={<Support />} />
        <Route path="/attendance-viewer" element={<AttendanceViewer />} />
        <Route path="/gps-heatmap" element={<GpsHeatmap />} />
        <Route path="/settings" element={<Settings />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {location.pathname !== '/' && <Chatbot />}
      {location.pathname !== '/' && <DynamicNotifications />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AttendanceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppInner />
          </BrowserRouter>
        </TooltipProvider>
      </AttendanceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
