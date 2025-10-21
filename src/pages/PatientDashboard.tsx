import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PatientSidebar } from "@/components/PatientSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Calendar, FileText, Heart, Stethoscope, User, Clock, Star, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import BookingForm from "@/components/BookingForm";

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

interface Appointment {
  _id: string;
  doctor: Doctor;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  type: string;
  mode: string;
}

interface HealthMetric {
  bloodPressure: string;
  heartRate: number;
  weight: number;
  height: number;
  bmi: number;
  lastUpdated: string;
}

const PatientDashboard = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric | null>(null);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const patientName = user?.firstName || "Patient";

  // Calculate health score based on various factors
  const calculateHealthScore = (metrics: HealthMetric | null, appointments: Appointment[]) => {
    let score = 75; // Base score

    if (metrics) {
      // Blood pressure scoring (120/80 is ideal)
      const bp = metrics.bloodPressure.split('/').map(Number);
      if (bp.length === 2) {
        const [systolic, diastolic] = bp;
        if (systolic >= 120 && systolic <= 129 && diastolic >= 80 && diastolic <= 84) score += 5;
        else if (systolic >= 130 || diastolic >= 85) score -= 10;
        else if (systolic < 120 && diastolic < 80) score += 2;
      }

      // Heart rate scoring (60-100 bpm is normal)
      if (metrics.heartRate >= 60 && metrics.heartRate <= 100) score += 5;
      else if (metrics.heartRate < 60 || metrics.heartRate > 100) score -= 5;

      // BMI scoring (18.5-24.9 is healthy)
      if (metrics.bmi >= 18.5 && metrics.bmi <= 24.9) score += 10;
      else if (metrics.bmi >= 25 && metrics.bmi <= 29.9) score -= 5;
      else if (metrics.bmi >= 30) score -= 10;
    }

    // Regular checkups boost score
    const recentAppointments = appointments.filter(apt => 
      new Date(apt.appointmentDate) > new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) // Last 6 months
    );
    if (recentAppointments.length > 0) score += 5;

    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, score));
  };

  // Fetch all data
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await api.get('/doctors');
        if (response.data.success) {
          setDoctors(response.data.doctors);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load doctors');
      }
    };

    const fetchAppointments = async () => {
      try {
        setAppointmentsLoading(true);
        const response = await api.get('/appointments/my-appointments');
        if (response.data.success) {
          setAppointments(response.data.appointments || []);
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          toast.error('Failed to load appointments');
        }
      } finally {
        setAppointmentsLoading(false);
      }
    };

    const fetchHealthMetrics = async () => {
      try {
        const response = await api.get('/health-metrics/latest');
        if (response.data.success) {
          setHealthMetrics(response.data.metrics);
        }
      } catch (err: any) {
        // If no metrics found, use default values
        setHealthMetrics({
          bloodPressure: "120/80",
          heartRate: 72,
          weight: 70,
          height: 170,
          bmi: 24.2,
          lastUpdated: new Date().toISOString()
        });
      }
    };

    const loadData = async () => {
      await Promise.all([
        fetchDoctors(),
        fetchAppointments(),
        fetchHealthMetrics()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Calculate health score when data changes
  useEffect(() => {
    if (!loading && !appointmentsLoading) {
      const score = calculateHealthScore(healthMetrics, appointments);
      setHealthScore(score);
    }
  }, [healthMetrics, appointments, loading, appointmentsLoading]);

  // Refresh appointments after booking
  const handleBookingSuccess = () => {
    fetchAppointments();
  };

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const response = await api.get('/appointments/my-appointments');
      if (response.data.success) {
        setAppointments(response.data.appointments || []);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load appointments');
      }
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Get recommended doctors and upcoming appointments
  const recommendedDoctors = doctors.slice(0, 3);
  const upcomingAppointments = appointments.filter(apt => 
    ['Scheduled', 'Confirmed'].includes(apt.status)
  ).slice(0, 3);

  const getDoctorFullName = (doctor: Doctor) => {
    return `Dr. ${doctor.firstName} ${doctor.lastName}`;
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getHealthStatus = (score: number) => {
    if (score >= 90) return { text: "Excellent", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 80) return { text: "Very Good", color: "text-green-500", bg: "bg-green-50" };
    if (score >= 70) return { text: "Good", color: "text-blue-500", bg: "bg-blue-50" };
    if (score >= 60) return { text: "Fair", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { text: "Needs Attention", color: "text-red-600", bg: "bg-red-50" };
  };

  const healthStatus = getHealthStatus(healthScore);

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
                    <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
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
                    <p className="text-2xl font-bold">{appointments.length}</p>
                    <p className="text-sm text-muted-foreground">Total Appointments</p>
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
                    <p className="text-2xl font-bold">{healthScore}%</p>
                    <p className={`text-sm font-medium ${healthStatus.color}`}>
                      {healthStatus.text}
                    </p>
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

                  {appointmentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Loading appointments...</p>
                    </div>
                  ) : upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div
                          key={appointment._id}
                          className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:shadow-soft transition-smooth"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 rounded-full p-3">
                              <Stethoscope className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">
                                {getDoctorFullName(appointment.doctor)}
                              </p>
                              <p className="text-sm text-muted-foreground">{appointment.doctor.specialty}</p>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
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
                            <BookingForm 
                              doctor={doctor} 
                              onBookingSuccess={handleBookingSuccess}
                            />
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-semibold">Health Overview</h3>
                    <Link to="/dashboard/patient/health-metrics">
                      <Button variant="ghost" size="sm">Update</Button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {healthMetrics ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Blood Pressure</span>
                          <span className="font-medium">{healthMetrics.bloodPressure}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Heart Rate</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{healthMetrics.heartRate} bpm</span>
                            {healthMetrics.heartRate >= 60 && healthMetrics.heartRate <= 100 ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Weight</span>
                          <span className="font-medium">{healthMetrics.weight} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">BMI</span>
                          <span className={`font-medium ${
                            healthMetrics.bmi >= 18.5 && healthMetrics.bmi <= 24.9 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {healthMetrics.bmi.toFixed(1)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>No health metrics recorded</p>
                        <Link to="/dashboard/patient/health-metrics">
                          <Button size="sm" variant="outline" className="mt-2">
                            Add Health Metrics
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Health Score Breakdown */}
                <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <h3 className="font-heading font-semibold mb-4">Health Score</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Overall Score</span>
                        <span className="font-medium">{healthScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            healthScore >= 80 ? 'bg-green-500' :
                            healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${healthScore}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Based on vital signs and health metrics</p>
                      <p>• Regular checkups improve your score</p>
                      <p>• Update your metrics for accurate scoring</p>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  <h3 className="font-heading font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link to="/dashboard/patient/profile" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Link to="/dashboard/patient/records" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Medical Records
                      </Button>
                    </Link>
                    <Link to="/doctors" className="block">
                      <Button className="w-full justify-start bg-primary hover:bg-primary-hover">
                        <Stethoscope className="mr-2 h-4 w-4" />
                        Find Doctors
                      </Button>
                    </Link>
                  </div>
                </Card>
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