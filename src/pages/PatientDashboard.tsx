import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PatientSidebar } from "@/components/PatientSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Calendar, FileText, Heart, Stethoscope, User, Clock } from "lucide-react";

const PatientDashboard = () => {
  const { user } = useAuth();
  const patientName = user?.firstName || "Patient";
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "2025-10-20",
      time: "10:00 AM",
      status: "Scheduled",
    },
  ];

  const recentDoctors = [
    {
      id: 1,
      name: "Dr. Michael Chen",
      specialty: "General Physician",
      image: "👨‍⚕️",
      experience: "15 years",
    },
    {
      id: 2,
      name: "Dr. Emily Williams",
      specialty: "Dermatologist",
      image: "👩‍⚕️",
      experience: "10 years",
    },
    {
      id: 3,
      name: "Dr. James Brown",
      specialty: "Orthopedic",
      image: "👨‍⚕️",
      experience: "12 years",
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-secondary">
        <Navbar />

        <div className="flex flex-1 w-full">
          <PatientSidebar />

          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="mb-4">
              <SidebarTrigger />
            </div>
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-heading font-bold mb-2">
            Welcome back, {patientName}! 👋
          </h1>
          <p className="text-muted-foreground">Here's your health overview</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 hover:shadow-medium transition-smooth animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-smooth animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Records</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-smooth animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Doctors</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-smooth animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <Heart className="h-6 w-6 text-primary" fill="currentColor" />
              </div>
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-muted-foreground">Health Score</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <Card className="p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold">Upcoming Appointments</h2>
                <Link to="/doctors">
                  <Button variant="outline" size="sm">
                    Book New
                  </Button>
                </Link>
              </div>

              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:shadow-soft transition-smooth"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 rounded-full p-3">
                          <Stethoscope className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{appointment.doctor}</p>
                          <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              {appointment.date} at {appointment.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming appointments</p>
                  <Link to="/doctors">
                    <Button className="mt-4 bg-primary hover:bg-primary-hover">
                      Book Your First Appointment
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Find Doctors Section */}
            <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-xl font-heading font-bold mb-6">Recommended Doctors</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="p-4 bg-secondary rounded-lg hover:shadow-medium transition-smooth text-center"
                  >
                    <div className="text-4xl mb-3">{doctor.image}</div>
                    <p className="font-semibold mb-1">{doctor.name}</p>
                    <p className="text-sm text-muted-foreground mb-2">{doctor.specialty}</p>
                    <p className="text-xs text-muted-foreground mb-3">{doctor.experience} experience</p>
                    <Button size="sm" className="w-full bg-primary hover:bg-primary-hover">
                      Book Now
                    </Button>
                  </div>
                ))}
              </div>
              <Link to="/doctors">
                <Button variant="outline" className="w-full mt-4">
                  View All Doctors
                </Button>
              </Link>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Health Overview */}
            <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <h3 className="font-heading font-semibold mb-4">Health Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Blood Pressure</span>
                    <span className="font-medium">120/80</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Heart Rate</span>
                    <span className="font-medium">72 bpm</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="font-medium">70 kg</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="font-heading font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Medical Records
                </Button>
                <Link to="/doctors" className="block">
                  <Button className="w-full justify-start bg-primary hover:bg-primary-hover">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Find Doctors
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

export default PatientDashboard;
