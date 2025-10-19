// ============================================
// FILE: src/lib/api.ts (UPDATED)
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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request setup failed:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.response?.status || 'NETWORK'} ${error.config?.url}`);
    
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - Check if backend is running');
    }
    
    return Promise.reject(error);
  }
);

export default api;