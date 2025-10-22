// ============================================
// FILE: src/pages/DoctorDashboard.tsx (BACKEND INTEGRATED)
// ============================================
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DoctorSidebar } from "@/components/DoctorSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Users, Clock, TrendingUp, User, Settings } from "lucide-react";
import appointmentService from "@/services/appointmentService";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Appointment {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  type: string;
  mode: string;
  reason: string;
}

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    weekAppointments: 0,
    rating: 0,
  });

  const doctorName = `Dr. ${user?.firstName || "Doctor"}`;
  const specialty = user?.specialty || "Healthcare Provider";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all appointments
      const appointmentsResponse = await appointmentService.getAllAppointments();
      
      if (appointmentsResponse.success) {
        const allAppointments = appointmentsResponse.appointments || [];
        setAppointments(allAppointments);
        
        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const todayCount = allAppointments.filter((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= today && aptDate <= todayEnd && 
                 ['Scheduled', 'Confirmed'].includes(apt.status);
        }).length;
        
        const weekCount = allAppointments.filter((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= weekStart && aptDate <= weekEnd;
        }).length;
        
        // Count unique patients
        const uniquePatients = new Set(
          allAppointments.map((apt: Appointment) => apt.patient._id)
        );
        
        setStats({
          todayAppointments: todayCount,
          totalPatients: uniquePatients.size,
          weekAppointments: weekCount,
          rating: user?.rating || 5.0,
        });
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  const getTodayAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= today && aptDate <= todayEnd && 
             ['Scheduled', 'Confirmed'].includes(apt.status);
    }).slice(0, 3);
  };

  const getRecentConsultations = () => {
    return appointments
      .filter((apt) => apt.status === 'Completed')
      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col w-full bg-secondary">
          <Navbar />
          <div className="flex flex-1 w-full">
            <DoctorSidebar />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </SidebarProvider>
    );
  }

  const todayAppointments = getTodayAppointments();
  const recentConsultations = getRecentConsultations();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-secondary">
        <Navbar />

        <div className="flex flex-1 w-full">
          <DoctorSidebar />

          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="mb-4">
              <SidebarTrigger />
            </div>

            {/* Welcome Header */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-heading font-bold mb-2">
                Welcome, {doctorName}! 👋
              </h1>
              <p className="text-muted-foreground">{specialty}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6 hover:shadow-medium transition-smooth animate-slide-up">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.todayAppointments}</p>
                    <p className="text-sm text-muted-foreground">Today's Appointments</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-medium transition-smooth animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalPatients}</p>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-medium transition-smooth animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.weekAppointments}</p>
                    <p className="text-sm text-muted-foreground">This Week</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-medium transition-smooth animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.rating.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Today's Appointments */}
                <Card className="p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-heading font-bold">Today's Schedule</h2>
                    <Link to="/dashboard/doctor/appointments">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>

                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No appointments scheduled for today</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments.map((appointment) => (
                        <div
                          key={appointment._id}
                          className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:shadow-soft transition-smooth"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 rounded-full p-3">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">
                                {appointment.patient.firstName} {appointment.patient.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{appointment.type}</p>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{appointment.appointmentTime}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                              {appointment.status}
                            </span>
                            <Link to={`/dashboard/doctor/appointments`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Recent Consultations */}
                <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <h2 className="text-xl font-heading font-bold mb-6">Recent Consultations</h2>
                  {recentConsultations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No completed consultations yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentConsultations.map((consultation) => (
                        <div key={consultation._id} className="p-4 bg-secondary rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">
                                {consultation.patient.firstName} {consultation.patient.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{consultation.type}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(consultation.appointmentDate)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {consultation.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Availability Status */}
                <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <h3 className="font-heading font-semibold mb-4">Availability</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Available</span>
                    </div>
                  </div>
                  <Link to="/dashboard/doctor/schedule">
                    <Button variant="outline" className="w-full">
                      Manage Schedule
                    </Button>
                  </Link>
                </Card>

                {/* Profile Summary */}
                <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <h3 className="font-heading font-semibold mb-4">Profile Summary</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Specialty</p>
                      <p className="font-medium">{specialty}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium">{user?.yearsOfExperience || 0} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Consultations</p>
                      <p className="font-medium">{appointments.filter(a => a.status === 'Completed').length}</p>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  <h3 className="font-heading font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link to="/dashboard/doctor/settings">
                      <Button variant="outline" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Link to="/dashboard/doctor/settings">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                    <Link to="/dashboard/doctor/appointments">
                      <Button className="w-full justify-start bg-primary hover:bg-primary-hover">
                        <Calendar className="mr-2 h-4 w-4" />
                        View Calendar
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default DoctorDashboard;