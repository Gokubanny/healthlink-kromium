import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PatientSidebar } from "@/components/PatientSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Camera, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const PatientProfile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.put('/users/profile', formData);
      
      if (response.data.success) {
        updateProfile(response.data.user);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('profilePicture', file);

        const response = await api.put('/users/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          updateProfile(response.data.user);
          toast.success("Profile picture updated!");
        }
      } catch (error: any) {
        console.error("Error uploading profile picture:", error);
        toast.error(error.response?.data?.message || "Failed to update profile picture");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
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

            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-heading font-bold mb-2">My Profile</h1>
              <p className="text-muted-foreground">Manage your personal information</p>
            </div>

            <div className="max-w-2xl">
              <Card className="p-6 mb-6 animate-fade-in">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={user?.profilePicture} />
                      <AvatarFallback className="text-2xl">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="profile-upload"
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary-hover transition-smooth"
                    >
                      <Camera className="h-4 w-4" />
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={loading}
                    />
                  </div>
                  <h2 className="text-2xl font-bold mt-4">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-muted-foreground">Patient</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!isEditing || loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!isEditing || loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing || loading}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing || loading}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    {isEditing ? (
                      <>
                        <Button 
                          onClick={handleSave} 
                          className="flex-1"
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button 
                          onClick={handleCancel} 
                          variant="outline" 
                          className="flex-1"
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setIsEditing(true)} 
                        className="w-full"
                        disabled={loading}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default PatientProfile;