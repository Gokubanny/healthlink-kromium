import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DoctorSidebar } from "@/components/DoctorSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { User, Search, Mail, Phone } from "lucide-react";

const DoctorPatients = () => {
  const patients = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 234-567-8900",
      lastVisit: "2025-10-15",
      condition: "Hypertension",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1 234-567-8901",
      lastVisit: "2025-10-18",
      condition: "Diabetes Type 2",
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael.brown@email.com",
      phone: "+1 234-567-8902",
      lastVisit: "2025-10-19",
      condition: "Asthma",
    },
    {
      id: 4,
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      phone: "+1 234-567-8903",
      lastVisit: "2025-10-10",
      condition: "General Checkup",
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
              <h1 className="text-3xl font-heading font-bold mb-2">My Patients</h1>
              <p className="text-muted-foreground">View and manage your patient records</p>
            </div>

            <Card className="p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search patients by name..." className="pl-10" />
              </div>
            </Card>

            <div className="grid gap-4">
              {patients.map((patient) => (
                <Card key={patient.id} className="p-6 animate-fade-in hover:shadow-medium transition-smooth">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg">{patient.name}</h3>
                          <p className="text-sm text-muted-foreground">{patient.condition}</p>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{patient.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{patient.phone}</span>
                          </div>
                          <p>Last Visit: {patient.lastVisit}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">View Records</Button>
                      <Button size="sm" variant="outline">
                        Contact
                      </Button>
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

export default DoctorPatients;
