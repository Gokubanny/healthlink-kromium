// ============================================
// FILE: src/services/authService.ts
// ============================================
import api from '@/lib/api';

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

export interface AuthResponse {
  success: boolean;
  token: string;
  user: any;
  message?: string;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('👤 Starting registration...');
      
      const response = await api.post('/auth/register', data);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Registration successful - token stored');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      
      let message = 'Registration failed';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      } else if (error.code === 'ERR_NETWORK') {
        message = 'Cannot connect to server. Please check your connection.';
      }
      
      throw new Error(message);
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Starting login...');
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Login successful - token stored');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      let message = 'Login failed';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      } else if (error.code === 'ERR_NETWORK') {
        message = 'Cannot connect to server. Please check your connection.';
      }
      
      throw new Error(message);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ User logged out');
  }
}

export default new AuthService();