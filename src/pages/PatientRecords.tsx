import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PatientSidebar } from "@/components/PatientSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FileText, Download, Eye, Plus, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import medicalRecordService from "@/services/medicalRecordService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  description?: string;
}

const PatientRecords = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newRecord, setNewRecord] = useState({
    title: "",
    type: "Other",
    date: new Date().toISOString().split('T')[0],
    description: "",
    file: null as File | null,
  });

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await medicalRecordService.getMyRecords();
      
      if (response.success) {
        setRecords(response.records || []);
      } else {
        throw new Error(response.message || 'Failed to fetch medical records');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewRecord({ ...newRecord, file });
    }
  };

  const handleAddRecord = async () => {
    if (!newRecord.title.trim()) {
      toast.error("Please enter a title for the record");
      return;
    }

    try {
      setUploading(true);
      
      const recordData = {
        title: newRecord.title,
        type: newRecord.type,
        date: newRecord.date,
        description: newRecord.description,
        file: newRecord.file,
      };

      const response = await medicalRecordService.uploadPatientRecord(recordData);

      if (response.success) {
        toast.success("Medical record added successfully!");
        setRecords([response.record, ...records]);
        setIsDialogOpen(false);
        setNewRecord({
          title: "",
          type: "Other",
          date: new Date().toISOString().split('T')[0],
          description: "",
          file: null,
        });
      }
    } catch (error: any) {
      console.error("Error adding medical record:", error);
      toast.error(error.response?.data?.message || "Failed to add medical record");
    } finally {
      setUploading(false);
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

            <div className="flex justify-between items-center mb-8 animate-fade-in">
              <div>
                <h1 className="text-3xl font-heading font-bold mb-2">Medical Records</h1>
                <p className="text-muted-foreground">View and manage your medical documents</p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary-hover">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medical Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Medical Record</DialogTitle>
                    <DialogDescription>
                      Upload your medical documents for doctors to review
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Record Title</Label>
                      <Input
                        id="title"
                        value={newRecord.title}
                        onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                        placeholder="e.g., Blood Test Results, X-Ray Report"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Record Type</Label>
                      <select
                        id="type"
                        value={newRecord.type}
                        onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Lab Report">Lab Report</option>
                        <option value="Checkup Report">Checkup Report</option>
                        <option value="Imaging">Imaging (X-Ray, MRI, CT)</option>
                        <option value="Prescription">Prescription</option>
                        <option value="Immunization">Immunization Record</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="date">Record Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newRecord.date}
                        onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        value={newRecord.description}
                        onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                        placeholder="Brief description of this medical record..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="file">Upload File (Optional)</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported formats: PDF, JPG, PNG, DOC (Max 10MB)
                      </p>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={handleAddRecord} 
                        className="flex-1"
                        disabled={uploading || !newRecord.title.trim()}
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Add Record
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {records.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="font-heading font-bold text-xl mb-2">No medical records yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your medical records to help doctors provide better care
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-primary hover:bg-primary-hover"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Record
                </Button>
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
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{record.title}</h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Date: {formatDate(record.date)}</p>
                            <p>Type: {record.type}</p>
                            {record.doctor && (
                              <p>Added by: Dr. {record.doctor.firstName} {record.doctor.lastName}</p>
                            )}
                            {record.description && (
                              <p className="mt-2">{record.description}</p>
                            )}
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