// ============================================
// FILE: src/App.tsx (UPDATED)
// ============================================
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PatientDashboard from "./pages/PatientDashboard";
import PatientAppointments from "./pages/PatientAppointments";
import PatientRecords from "./pages/PatientRecords";
import PatientProfile from "./pages/PatientProfile";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorPatients from "./pages/DoctorPatients";
import DoctorSchedule from "./pages/DoctorSchedule";
import DoctorSettings from "./pages/DoctorSettings";
import DoctorList from "./pages/DoctorList";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Chatbot from "@/components/Chatbot";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Patient Routes */}
            <Route path="/dashboard/patient" element={<PatientDashboard />} />
            <Route path="/dashboard/patient/appointments" element={<PatientAppointments />} />
            <Route path="/dashboard/patient/records" element={<PatientRecords />} />
            <Route path="/dashboard/patient/profile" element={<PatientProfile />} />
            
            {/* Doctor Routes */}
            <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
            <Route path="/dashboard/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/dashboard/doctor/patients" element={<DoctorPatients />} />
            <Route path="/dashboard/doctor/schedule" element={<DoctorSchedule />} />
            <Route path="/dashboard/doctor/settings" element={<DoctorSettings />} />
            
            {/* Public Routes */}
            <Route path="/doctors" element={<DoctorList />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Chatbot />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;