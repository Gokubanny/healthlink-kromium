// ============================================
// FILE: src/context/AuthContext.tsx
// ============================================
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import authService from "@/services/authService";
import { toast } from "sonner";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "patient" | "doctor";
  phone?: string;
  specialty?: string;
  profilePicture?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        setUser(response.user as User);
        toast.success("Login successful! 🎉");
        
        if (response.user.role === "doctor") {
          navigate("/dashboard/doctor");
        } else {
          navigate("/dashboard/patient");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
      throw error;
    }
  };

  const signup = async (userData: any) => {
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(response.user as User);
        toast.success("Account created successfully! 🎉");
        
        if (response.user.role === "doctor") {
          navigate("/dashboard/doctor");
        } else {
          navigate("/dashboard/patient");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
      throw error;
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info("Logged out successfully");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      signup, 
      logout, 
      updateProfile, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};