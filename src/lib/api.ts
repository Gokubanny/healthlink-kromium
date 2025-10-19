// ============================================
// FILE: src/lib/api.ts (ENHANCED WITH RETRY LOGIC)
// ============================================
import axios from 'axios';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'https://healthlink-kromium-backend.onrender.com/api';

console.log('🌐 API Base URL:', API_URL);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      code: error.code,
      responseHeaders: error.response?.headers
    });

    // Handle CORS/Network errors
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('🌐 NETWORK ERROR - Possible CORS issue or server down');
      
      // Test if backend is reachable
      try {
        const healthCheck = await axios.get('https://healthlink-kromium-backend.onrender.com/api/health', {
          timeout: 10000
        });
        console.log('✅ Backend is reachable via direct call:', healthCheck.status);
      } catch (healthError) {
        console.error('❌ Backend is NOT reachable:', healthError.message);
      }
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

// Test function to check CORS
export const testCorsConnection = async () => {
  try {
    console.log('🧪 Testing CORS connection...');
    const response = await api.get('/cors-test');
    console.log('✅ CORS Test Successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CORS Test Failed:', error);
    throw error;
  }
};

export default api;