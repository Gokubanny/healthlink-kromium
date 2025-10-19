// FILE: src/pages/DoctorList.tsx (FIXED)
// ============================================
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Star, Calendar, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import doctorService from "@/services/doctorService";
import { useNavigate } from "react-router-dom";

const DoctorList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState<string[]>([]);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDoctors();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [specialty, searchTerm]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getAllDoctors({
        specialty: specialty !== "all" ? specialty : undefined,
        search: searchTerm || undefined,
        limit: 20,
        page: 1,
      });
      
      console.log("Doctors response:", response);
      setDoctors(response.doctors || []);
    } catch (error: any) {
      console.error("Error fetching doctors:", error);
      toast.error(error.response?.data?.message || "Failed to load doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await doctorService.getSpecialties();
      console.log("Specialties response:", response);
      setSpecialties(response.specialties || []);
    } catch (error: any) {
      console.error("Error fetching specialties:", error);
    }
  };

  const handleBookAppointment = (doctorId: string, doctorName: string) => {
    toast.success(`Opening booking form for ${doctorName}`);
    // You can implement a booking modal or navigate to a booking page
    // navigate(`/book-appointment/${doctorId}`);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading && doctors.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-secondary">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading doctors...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Find Your Doctor</h1>
          <p className="text-muted-foreground">
            Search from our network of {doctors.length} verified healthcare professionals
          </p>
        </div>

        <Card className="p-6 mb-8 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((spec: string) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {doctors.length} doctor{doctors.length !== 1 ? "s" : ""}
          </p>
          {loading && <span className="text-sm text-muted-foreground">Updating...</span>}
        </div>

        {doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {doctors.map((doctor: any, index: number) => (
              <Card
                key={doctor._id}
                className="p-6 hover:shadow-strong transition-smooth animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    {getInitials(doctor.firstName, doctor.lastName)}
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-1">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-primary text-sm font-medium mb-2">{doctor.specialty}</p>
                  <p className="text-xs text-muted-foreground">
                    {doctor.yearsOfExperience} years experience
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{doctor.rating?.toFixed(1) || "5.0"}</span>
                    <span className="text-sm text-muted-foreground">
                      ({doctor.reviewCount || 0} reviews)
                    </span>
                  </div>

                  {doctor.isVerified && (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Verified Doctor</span>
                    </div>
                  )}

                  <div className="text-center text-xs text-muted-foreground">
                    <p>{doctor.medicalSchool}</p>
                    <p>License: {doctor.licenseNumber}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-primary hover:bg-primary-hover"
                    onClick={() => handleBookAppointment(doctor._id, `Dr. ${doctor.firstName} ${doctor.lastName}`)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-heading font-bold text-xl mb-2">No doctors found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || specialty !== "all" 
                ? "Try adjusting your search or filters" 
                : "No doctors available at the moment"}
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSpecialty("all");
              }}
            >
              Clear Filters
            </Button>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DoctorList;