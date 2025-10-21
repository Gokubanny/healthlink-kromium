// ============================================
// FILE: src/pages/PatientAppointments.tsx (UPDATED)
// ============================================
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PatientSidebar } from "@/components/PatientSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Calendar, Clock, MapPin, User, Video } from "lucide-react";
import appointmentService from "@/services/appointmentService";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialty: string;
}

interface Appointment {
  _id: string;
  doctor: Doctor;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  type: string;
  mode: string;
  location?: string;
  reason?: string;
}

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getMyAppointments();
      console.log("Appointments response:", response);
      setAppointments(response.appointments || []);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || "Failed to load appointments");
      }
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await appointmentService.cancelAppointment(id);
      toast.success("Appointment cancelled successfully");
      fetchAppointments();
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const handleRescheduleAppointment = async (id: string) => {
    toast.info("Reschedule functionality coming soon!");
    // TODO: Implement reschedule functionality with a modal form
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Confirmed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col w-full bg-secondary">
          <Navbar />
          <div className="flex flex-1 w-full">
            <PatientSidebar />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading appointments...</p>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </SidebarProvider>
    );
  }

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

            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-heading font-bold mb-2">My Appointments</h1>
              <p className="text-muted-foreground">Manage your upcoming and past appointments</p>
            </div>

            {appointments.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="font-heading font-bold text-xl mb-2">No appointments yet</h3>
                <p className="text-muted-foreground mb-4">
                  Book your first appointment with one of our doctors
                </p>
                <Link to="/doctors">
                  <Button className="bg-primary hover:bg-primary-hover">
                    Find Doctors
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment: Appointment) => (
                  <Card
                    key={appointment._id}
                    className="p-6 animate-fade-in hover:shadow-medium transition-smooth"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 rounded-full p-3 flex-shrink-0">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {appointment.doctor?.specialty || "Healthcare Provider"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {appointment.type || "Consultation"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(appointment.appointmentDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.appointmentTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {appointment.mode === "Video Call" ? (
                                <Video className="h-4 w-4" />
                              ) : (
                                <MapPin className="h-4 w-4" />
                              )}
                              <span>{appointment.location || appointment.mode || "In-person"}</span>
                            </div>
                          </div>
                          {appointment.reason && (
                            <p className="text-sm text-muted-foreground">
                              <strong>Reason:</strong> {appointment.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span
                          className={`px-3 py-1 text-sm rounded-full text-center whitespace-nowrap ${getStatusColor(appointment.status)}`}
                        >
                          {appointment.status || "Scheduled"}
                        </span>
                        {(appointment.status === "Scheduled" || appointment.status === "Confirmed") && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRescheduleAppointment(appointment._id)}
                            >
                              Reschedule
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleCancelAppointment(appointment._id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>

        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default PatientAppointments;