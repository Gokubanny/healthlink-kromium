import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DoctorSidebar } from "@/components/DoctorSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Calendar, Clock, User, Video, MapPin } from "lucide-react";

const DoctorAppointments = () => {
  const appointments = [
    {
      id: 1,
      patient: "John Doe",
      date: "2025-10-20",
      time: "10:00 AM",
      type: "Consultation",
      mode: "In-person",
      status: "Scheduled",
    },
    {
      id: 2,
      patient: "Jane Smith",
      date: "2025-10-20",
      time: "11:30 AM",
      type: "Follow-up",
      mode: "Video Call",
      status: "Scheduled",
    },
    {
      id: 3,
      patient: "Michael Brown",
      date: "2025-10-20",
      time: "2:00 PM",
      type: "Consultation",
      mode: "In-person",
      status: "Scheduled",
    },
    {
      id: 4,
      patient: "Emma Wilson",
      date: "2025-10-21",
      time: "9:00 AM",
      type: "Routine Checkup",
      mode: "In-person",
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

            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-heading font-bold mb-2">Appointments</h1>
              <p className="text-muted-foreground">Manage your patient appointments</p>
            </div>

            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="p-6 animate-fade-in hover:shadow-medium transition-smooth">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg">{appointment.patient}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {appointment.mode === "Video Call" ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                            <span>{appointment.mode}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full text-center">
                        {appointment.status}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm">Start Consultation</Button>
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default DoctorAppointments;
