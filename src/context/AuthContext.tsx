// ============================================
// FILE: src/context/AuthContext.tsx (FIXED)
// ============================================
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import authService from "@/services/authService";
import { toast } from "sonner";
import api from "@/lib/api";

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
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (storedUser && token) {
        try {
          // Verify token is still valid by making a test request
          const response = await api.get('/api/users/profile');
          if (response.data.success) {
            setUser(JSON.parse(storedUser));
            console.log('✅ User authenticated from stored token');
          } else {
            // Token expired, clear storage
            console.log('❌ Token expired, clearing storage');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error: any) {
          console.log('❌ Token validation failed:', error.response?.status);
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      if (response.success && response.token) {
        // Store token and user data
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user as User);
        
        console.log('✅ Login successful - token stored:', response.token.substring(0, 20) + '...');
        toast.success(`Welcome back, ${response.user.firstName}! 🎉`);
        
        // Navigate based on role
        if (response.user.role === "doctor") {
          navigate("/dashboard/doctor");
        } else {
          navigate("/dashboard/patient");
        }
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      toast.error(error.message || "Login failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      if (response.success && response.token) {
        // Store token and user data
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user as User);
        
        console.log('✅ Registration successful - token stored');
        toast.success("Account created successfully! 🎉");
        
        // Navigate based on role
        if (response.user.role === "doctor") {
          navigate("/dashboard/doctor");
        } else {
          navigate("/dashboard/patient");
        }
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      toast.error(error.message || "Registration failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    }
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    
    console.log('✅ User logged out - storage cleared');
    toast.info("Logged out successfully");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user && !!localStorage.getItem('token'), 
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