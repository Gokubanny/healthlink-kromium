// ============================================
// FILE: src/pages/DoctorPatients.tsx (BACKEND INTEGRATED)
// ============================================
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DoctorSidebar } from "@/components/DoctorSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { User, Search, Mail, Phone, Calendar } from "lucide-react";
import appointmentService from "@/services/appointmentService";
import { toast } from "sonner";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  lastVisit?: string;
  appointmentCount?: number;
}

const DoctorPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter((patient) =>
        `${patient.firstName} ${patient.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      // Fetch all appointments for this doctor
      const response = await appointmentService.getAllAppointments();
      
      if (response.success) {
        const appointments = response.appointments || [];
        
        // Extract unique patients from appointments
        const patientMap = new Map<string, Patient>();
        
        appointments.forEach((appointment: any) => {
          const patient = appointment.patient;
          if (patient && patient._id) {
            if (!patientMap.has(patient._id)) {
              patientMap.set(patient._id, {
                _id: patient._id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                email: patient.email,
                phone: patient.phone,
                lastVisit: appointment.appointmentDate,
                appointmentCount: 1,
              });
            } else {
              const existing = patientMap.get(patient._id)!;
              existing.appointmentCount = (existing.appointmentCount || 0) + 1;
              
              // Update last visit if this appointment is more recent
              if (new Date(appointment.appointmentDate) > new Date(existing.lastVisit!)) {
                existing.lastVisit = appointment.appointmentDate;
              }
            }
          }
        });
        
        // Convert map to array and sort by last visit
        const patientsList = Array.from(patientMap.values()).sort((a, b) => {
          if (!a.lastVisit || !b.lastVisit) return 0;
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        });
        
        setPatients(patientsList);
        setFilteredPatients(patientsList);
      }
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load patients");
      }
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
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
                <p className="text-muted-foreground">Loading patients...</p>
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
              <h1 className="text-3xl font-heading font-bold mb-2">My Patients</h1>
              <p className="text-muted-foreground">
                {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""}
              </p>
            </div>

            <Card className="p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name or email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Card>

            {filteredPatients.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="font-heading font-bold text-xl mb-2">
                  {searchTerm ? "No patients found" : "No patients yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Patients will appear here once you have appointments"}
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredPatients.map((patient) => (
                  <Card
                    key={patient._id}
                    className="p-6 animate-fade-in hover:shadow-medium transition-smooth"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 rounded-full p-3">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {patient.firstName} {patient.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {patient.appointmentCount} consultation{patient.appointmentCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{patient.email}</span>
                            </div>
                            {patient.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{patient.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Last Visit: {formatDate(patient.lastVisit)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" disabled>
                          View Records
                        </Button>
                        <Button size="sm" variant="outline" disabled>
                          Contact
                        </Button>
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

export default DoctorPatients;