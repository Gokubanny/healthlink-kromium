// ============================================
// FILE: src/pages/DoctorAppointments.tsx (UPDATED)
// ============================================
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DoctorSidebar } from "@/components/DoctorSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Calendar, Clock, User, Video, MapPin } from "lucide-react";
import appointmentService from "@/services/appointmentService";
import { toast } from "sonner";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Appointment {
  _id: string;
  patient: Patient;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  type: string;
  mode: string;
  reason: string;
  location?: string;
}

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAllAppointments();
      
      if (response.success) {
        setAppointments(response.appointments || []);
      } else {
        throw new Error(response.message || 'Failed to load appointments');
      }
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

  const handleStartConsultation = async (appointmentId: string) => {
    try {
      // Update appointment status to "Completed"
      await appointmentService.updateAppointment(appointmentId, {
        status: 'Completed'
      });
      
      toast.success("Consultation marked as completed");
      fetchAppointments();
    } catch (error: any) {
      console.error("Error starting consultation:", error);
      toast.error(error.response?.data?.message || "Failed to start consultation");
    }
  };

  const handleRescheduleAppointment = async (appointmentId: string) => {
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
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "Confirmed":
        return "bg-blue-100 text-blue-700";
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
            <DoctorSidebar />
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
          <DoctorSidebar />

          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="mb-4">
              <SidebarTrigger />
            </div>

            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-heading font-bold mb-2">Appointments</h1>
              <p className="text-muted-foreground">Manage your patient appointments</p>
            </div>

            {appointments.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="font-heading font-bold text-xl mb-2">No appointments scheduled</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any upcoming appointments
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card key={appointment._id} className="p-6 animate-fade-in hover:shadow-medium transition-smooth">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 rounded-full p-3">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {appointment.patient.firstName} {appointment.patient.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{appointment.type}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              <strong>Reason:</strong> {appointment.reason}
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
                              <span>{appointment.mode}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 text-sm rounded-full text-center ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        <div className="flex gap-2">
                          {(appointment.status === "Scheduled" || appointment.status === "Confirmed") && (
                            <>
                              <Button 
                                size="sm"
                                onClick={() => handleStartConsultation(appointment._id)}
                              >
                                Complete Consultation
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRescheduleAppointment(appointment._id)}
                              >
                                Reschedule
                              </Button>
                            </>
                          )}
                          {appointment.status === "Completed" && (
                            <Button size="sm" variant="outline" disabled>
                              Consultation Completed
                            </Button>
                          )}
                        </div>
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

export default DoctorAppointments;