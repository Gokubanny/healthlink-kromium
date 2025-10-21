import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PatientSidebar } from "@/components/PatientSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FileText, Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

interface MedicalRecord {
  _id: string;
  title: string;
  date: string;
  doctor: {
    firstName: string;
    lastName: string;
  };
  type: string;
  fileUrl?: string;
}

const PatientRecords = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-records/my-records');
      
      if (response.data.success) {
        setRecords(response.data.records || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch medical records');
      }
    } catch (error: any) {
      console.error("Error fetching medical records:", error);
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || "Failed to load medical records");
      }
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = (record: MedicalRecord) => {
    if (record.fileUrl) {
      window.open(record.fileUrl, '_blank');
    } else {
      toast.info("No file available for this record");
    }
  };

  const handleDownloadRecord = async (record: MedicalRecord) => {
    if (record.fileUrl) {
      try {
        const response = await fetch(record.fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${record.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Record downloaded successfully");
      } catch (error) {
        console.error("Error downloading record:", error);
        toast.error("Failed to download record");
      }
    } else {
      toast.info("No file available for download");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
                <p className="text-muted-foreground">Loading medical records...</p>
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
              <h1 className="text-3xl font-heading font-bold mb-2">Medical Records</h1>
              <p className="text-muted-foreground">View and download your medical documents</p>
            </div>

            {records.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="font-heading font-bold text-xl mb-2">No medical records yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your medical records will appear here after your appointments
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {records.map((record) => (
                  <Card key={record._id} className="p-6 animate-fade-in hover:shadow-medium transition-smooth">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 rounded-lg p-3">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{record.title}</h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Date: {formatDate(record.date)}</p>
                            <p>Doctor: Dr. {record.doctor.firstName} {record.doctor.lastName}</p>
                            <p>Type: {record.type}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewRecord(record)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadRecord(record)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
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

export default PatientRecords;