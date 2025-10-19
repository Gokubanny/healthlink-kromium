// ============================================
// FILE: src/lib/api.ts (ENHANCED WITH BETTER ERROR HANDLING)
// ============================================
import axios from 'axios';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'https://healthlink-kromium-backend.onrender.com/api';

console.log('API Base URL:', API_URL);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased timeout to 30 seconds
  withCredentials: false, // Set to false if not using cookies
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add unique identifier for CORS
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  (error) => {
    const errorDetails = {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      code: error.code
    };
    
    console.error('❌ API Error:', errorDetails);
    
    // Handle CORS-specific errors
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.error('🌐 CORS/Network Error - Check backend CORS configuration');
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/signin')) {
        window.location.href = '/signin';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;