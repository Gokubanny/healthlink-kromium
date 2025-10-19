// ============================================
// FILE: src/services/authService.ts
// ============================================
import api, { testCorsConnection } from '@/lib/api';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  phone: string;
  specialty?: string;
  licenseNumber?: string;
  yearsOfExperience?: string;
  medicalSchool?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone?: string;
    specialty?: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('🔐 Registering user:', { ...data, password: '***' });
      
      // Test CORS first
      await testCorsConnection();
      
      const response = await api.post('/auth/register', data);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Registration successful, token stored');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('🔐 Logging in user:', { ...data, password: '***' });
      
      // Test CORS first
      await testCorsConnection();
      
      const response = await api.post('/auth/login', data);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Login successful, token stored');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('❌ Get current user failed:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ User logged out');
  }
}

export default new AuthService();