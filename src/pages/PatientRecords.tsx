import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PatientSidebar } from "@/components/PatientSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FileText, Download, Eye } from "lucide-react";

const PatientRecords = () => {
  const records = [
    {
      id: 1,
      title: "Blood Test Results",
      date: "2025-10-15",
      doctor: "Dr. Sarah Johnson",
      type: "Lab Report",
    },
    {
      id: 2,
      title: "Annual Physical Examination",
      date: "2025-09-20",
      doctor: "Dr. Michael Chen",
      type: "Checkup Report",
    },
    {
      id: 3,
      title: "X-Ray - Chest",
      date: "2025-08-10",
      doctor: "Dr. James Brown",
      type: "Imaging",
    },
    {
      id: 4,
      title: "Prescription - Blood Pressure Medication",
      date: "2025-07-05",
      doctor: "Dr. Sarah Johnson",
      type: "Prescription",
    },
    {
      id: 5,
      title: "Vaccination Record",
      date: "2025-06-15",
      doctor: "Dr. Emily Williams",
      type: "Immunization",
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

            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-heading font-bold mb-2">Medical Records</h1>
              <p className="text-muted-foreground">View and download your medical documents</p>
            </div>

            <div className="grid gap-4">
              {records.map((record) => (
                <Card key={record.id} className="p-6 animate-fade-in hover:shadow-medium transition-smooth">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 rounded-lg p-3">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{record.title}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Date: {record.date}</p>
                          <p>Doctor: {record.doctor}</p>
                          <p>Type: {record.type}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
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

export default PatientRecords;
