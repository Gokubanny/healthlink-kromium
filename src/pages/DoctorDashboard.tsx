import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DoctorSidebar } from "@/components/DoctorSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Users, Clock, TrendingUp, User, Settings } from "lucide-react";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const doctorName = `Dr. ${user?.firstName || "Doctor"}`;
  const specialty = user?.specialty || "Healthcare Provider";

  const todayAppointments = [
    {
      id: 1,
      patient: "John Doe",
      time: "10:00 AM",
      type: "Consultation",
      status: "Scheduled",
    },
    {
      id: 2,
      patient: "Jane Smith",
      time: "11:30 AM",
      type: "Follow-up",
      status: "Scheduled",
    },
    {
      id: 3,
      patient: "Michael Brown",
      time: "2:00 PM",
      type: "Consultation",
      status: "Scheduled",
    },
  ];

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
                <p className="text-2xl font-bold">3</p>
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
                <p className="text-2xl font-bold">42</p>
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
                <p className="text-2xl font-bold">12</p>
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
                <p className="text-2xl font-bold">4.9</p>
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
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:shadow-soft transition-smooth"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{appointment.patient}</p>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                        {appointment.status}
                      </span>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Patient History */}
            <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-xl font-heading font-bold mb-6">Recent Consultations</h2>
              <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">Emma Wilson</p>
                      <p className="text-sm text-muted-foreground">Routine Checkup</p>
                    </div>
                    <span className="text-sm text-muted-foreground">Oct 15, 2025</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Patient reported improved symptoms. Continue current medication.
                  </p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">Robert Chen</p>
                      <p className="text-sm text-muted-foreground">Follow-up Visit</p>
                    </div>
                    <span className="text-sm text-muted-foreground">Oct 14, 2025</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Blood pressure stable. Scheduled next appointment in 2 weeks.
                  </p>
                </div>
              </div>
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
              <Button variant="outline" className="w-full">
                Manage Schedule
              </Button>
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
                  <p className="font-medium">15 years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Consultations</p>
                  <p className="font-medium">1,247</p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <h3 className="font-heading font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button className="w-full justify-start bg-primary hover:bg-primary-hover">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </Button>
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
