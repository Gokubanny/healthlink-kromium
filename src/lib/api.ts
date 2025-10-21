// ============================================
// FILE: src/lib/api.ts (ENHANCED TOKEN HANDLING)
// ============================================
import axios from 'axios';

const API_URL = 'https://healthlink-kromium-backend-k5ig.onrender.com/api';

console.log('🌐 API Base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor - Enhanced token handling
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔐 Adding token to request: ${token.substring(0, 20)}...`);
    } else {
      console.log('⚠️ No token found in localStorage for request');
    }
    
    console.log(`➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // Log full headers in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📨 Request Headers:', config.headers);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request setup failed:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Enhanced error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📨 Response Data:', response.data);
    }
    
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase();
    
    console.error(`❌ ${status || 'NETWORK'} ${method} ${url}`);
    
    // Enhanced error logging
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - Check if backend is running at:', API_URL);
      console.error('💡 Check if:');
      console.error('   - Backend server is running');
      console.error('   - CORS is properly configured');
      console.error('   - Network connection is stable');
    }
    
    if (status === 401) {
      console.error('🔐 401 Unauthorized - Token may be invalid or expired');
      console.log('🔄 Clearing auth data and redirecting to login...');
      
      // Clear invalid auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/signin')) {
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1000);
      }
    }
    
    if (status === 404) {
      console.error('🔍 404 Not Found - Endpoint does not exist:', url);
    }
    
    if (status >= 500) {
      console.error('🚨 Server Error - Backend may be experiencing issues');
    }
    
    return Promise.reject(error);
  }
);

// Add helper methods for auth
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
  console.log('✅ Auth token set in localStorage');
};

export const clearAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('✅ Auth tokens cleared from localStorage');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const isTokenExpired = (): boolean => {
  const token = getAuthToken();
  if (!token) return true;
  
  try {
    // Simple check - in production, use a proper JWT library
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export default api;