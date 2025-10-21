import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PatientSidebar } from "@/components/PatientSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Calendar, FileText, Heart, Stethoscope, User, Clock, Star } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  yearsOfExperience: number;
  rating: number;
  reviewCount: number;
  profilePicture?: string;
  isVerified: boolean;
}

const PatientDashboard = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const patientName = user?.firstName || "Patient";
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "2025-10-20",
      time: "10:00 AM",
      status: "Scheduled",
    },
  ];

  // Fetch doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching doctors from backend...');
        
        const response = await api.get('/doctors');
        
        if (response.data.success) {
          console.log('✅ Doctors fetched successfully:', response.data.doctors.length);
          setDoctors(response.data.doctors);
        } else {
          throw new Error(response.data.message || 'Failed to fetch doctors');
        }
      } catch (err: any) {
        console.error('❌ Error fetching doctors:', err);
        setError(err.response?.data?.message || 'Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Get recommended doctors (first 3 doctors)
  const recommendedDoctors = doctors.slice(0, 3);

  // Function to get doctor's full name
  const getDoctorFullName = (doctor: Doctor) => {
    return `Dr. ${doctor.firstName} ${doctor.lastName}`;
  };

  // Function to get doctor emoji based on specialty
  const getDoctorEmoji = (specialty: string) => {
    const emojiMap: { [key: string]: string } = {
      'cardiologist': '❤️',
      'dermatologist': '🔬',
      'orthopedic': '🦴',
      'pediatrician': '👶',
      'neurologist': '🧠',
      'psychiatrist': '🧠',
      'dentist': '🦷',
      'ophthalmologist': '👁️',
      'general': '👨‍⚕️',
      'surgeon': '🔪'
    };
    
    return emojiMap[specialty.toLowerCase()] || '👨‍⚕️';
  };

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
            
            {/* Welcome Header */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-heading font-bold mb-2">
                Welcome back, {patientName}! 👋
              </h1>
              <p className="text-muted-foreground">Here's your health overview</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6 hover:shadow-medium transition-smooth animate-slide-up">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-medium transition-smooth animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-muted-foreground">Records</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-medium transition-smooth animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{doctors.length}</p>
                    <p className="text-sm text-muted-foreground">Doctors</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-medium transition-smooth animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Heart className="h-6 w-6 text-primary" fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">98%</p>
                    <p className="text-sm text-muted-foreground">Health Score</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upcoming Appointments */}
                <Card className="p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-heading font-bold">Upcoming Appointments</h2>
                    <Link to="/doctors">
                      <Button variant="outline" size="sm">
                        Book New
                      </Button>
                    </Link>
                  </div>

                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:shadow-soft transition-smooth"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 rounded-full p-3">
                              <Stethoscope className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{appointment.doctor}</p>
                              <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {appointment.date} at {appointment.time}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                            {appointment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No upcoming appointments</p>
                      <Link to="/doctors">
                        <Button className="mt-4 bg-primary hover:bg-primary-hover">
                          Book Your First Appointment
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>

                {/* Find Doctors Section */}
                <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-heading font-bold">Recommended Doctors</h2>
                    <Link to="/doctors">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Loading doctors...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Unable to load doctors</p>
                      <p className="text-sm mt-1">{error}</p>
                      <Button 
                        onClick={() => window.location.reload()} 
                        variant="outline" 
                        className="mt-4"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : recommendedDoctors.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recommendedDoctors.map((doctor) => (
                          <div
                            key={doctor._id}
                            className="p-4 bg-secondary rounded-lg hover:shadow-medium transition-smooth text-center"
                          >
                            <div className="text-4xl mb-3">
                              {getDoctorEmoji(doctor.specialty)}
                            </div>
                            <p className="font-semibold mb-1">{getDoctorFullName(doctor)}</p>
                            <p className="text-sm text-muted-foreground mb-2 capitalize">
                              {doctor.specialty}
                            </p>
                            <div className="flex items-center justify-center gap-1 mb-2">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">
                                {doctor.rating.toFixed(1)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({doctor.reviewCount} reviews)
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              {doctor.yearsOfExperience} years experience
                            </p>
                            {doctor.isVerified && (
                              <div className="mb-2">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Verified
                                </span>
                              </div>
                            )}
                            <Link to={`/doctors/${doctor._id}`}>
                              <Button size="sm" className="w-full bg-primary hover:bg-primary-hover">
                                Book Now
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                      <Link to="/doctors">
                        <Button variant="outline" className="w-full mt-4">
                          View All {doctors.length} Doctors
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No doctors available at the moment</p>
                      <p className="text-sm mt-1">Please check back later</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Health Overview */}
                <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <h3 className="font-heading font-semibold mb-4">Health Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Blood Pressure</span>
                        <span className="font-medium">120/80</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Heart Rate</span>
                        <span className="font-medium">72 bpm</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Weight</span>
                        <span className="font-medium">70 kg</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <h3 className="font-heading font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Medical Records
                    </Button>
                    <Link to="/doctors" className="block">
                      <Button className="w-full justify-start bg-primary hover:bg-primary-hover">
                        <Stethoscope className="mr-2 h-4 w-4" />
                        Find Doctors
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* Available Specialties */}
                {doctors.length > 0 && (
                  <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                    <h3 className="font-heading font-semibold mb-4">Available Specialties</h3>
                    <div className="space-y-2">
                      {Array.from(new Set(doctors.map(d => d.specialty))).slice(0, 5).map((specialty, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{specialty}</span>
                          <span className="font-medium">
                            {doctors.filter(d => d.specialty === specialty).length}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default PatientDashboard;