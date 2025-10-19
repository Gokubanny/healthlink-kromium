// ============================================
// FILE: backend/server.js (DEFINITIVE CORS FIX)
// ============================================
const express = require('express');

const app = express();

// ============================================
// STEP 1: MANUAL CORS MIDDLEWARE - HANDLES EVERYTHING
// ============================================

// Global CORS handler - intercepts ALL requests
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  
  // Set CORS headers for EVERY response
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests IMMEDIATELY
  if (req.method === 'OPTIONS') {
    console.log('✅ Preflight request handled successfully');
    return res.status(200).send();
  }
  
  next();
});

// ============================================
// STEP 2: Body Parsing
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// STEP 3: HEALTH CHECK ENDPOINT
// ============================================

app.get('/api/health', (req, res) => {
  console.log('✅ Health check - CORS headers should be set');
  res.json({ 
    success: true,
    status: 'OK',
    message: '🚀 Kromium Health API Server is RUNNING!',
    timestamp: new Date().toISOString(),
    cors: 'ENABLED',
    version: '2.0.0'
  });
});

// ============================================
// STEP 4: CORS TEST ENDPOINT
// ============================================

app.get('/api/cors-test', (req, res) => {
  console.log('✅ CORS test - Checking headers');
  res.json({
    success: true,
    message: '🎉 CORS is WORKING PERFECTLY!',
    timestamp: new Date().toISOString(),
    yourOrigin: req.headers.origin,
    corsEnabled: true
  });
});

// ============================================
// STEP 5: AUTH ENDPOINTS
// ============================================

// REGISTER ENDPOINT
app.post('/api/auth/register', (req, res) => {
  try {
    console.log('📝 Registration attempt received');
    
    const { firstName, lastName, email, password, role, phone, specialty, licenseNumber, yearsOfExperience, medicalSchool } = req.body;
    
    console.log('📧 Registration data:', { firstName, lastName, email, role });
    
    // Basic validation
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Create mock user response
    const user = {
      id: 'user-' + Date.now(),
      firstName,
      lastName,
      email,
      role,
      phone: phone || '',
      specialty: specialty || '',
      licenseNumber: licenseNumber || '',
      yearsOfExperience: yearsOfExperience || '',
      medicalSchool: medicalSchool || '',
      isVerified: role === 'doctor',
      profilePicture: '',
      createdAt: new Date().toISOString()
    };
    
    // Mock JWT token
    const token = 'jwt-token-' + Date.now();
    
    console.log('✅ User registered successfully');
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token,
      user
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// LOGIN ENDPOINT
app.post('/api/auth/login', (req, res) => {
  try {
    console.log('🔐 Login attempt received');
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Mock user
    const user = {
      id: 'user-12345',
      firstName: 'Demo',
      lastName: 'User',
      email: email,
      role: 'patient',
      phone: '+1234567890',
      isVerified: true,
      profilePicture: '',
      createdAt: new Date().toISOString()
    };
    
    // Mock JWT token
    const token = 'jwt-token-' + Date.now();
    
    console.log('✅ User logged in successfully');
    
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// ============================================
// STEP 6: ROOT ENDPOINT
// ============================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Kromium Health API Server v2.0',
    version: '2.0.0',
    status: 'operational',
    cors: 'fully-enabled',
    timestamp: new Date().toISOString(),
    endpoints: {
      root: 'GET /',
      health: 'GET /api/health',
      corsTest: 'GET /api/cors-test',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
    }
  });
});

// ============================================
// STEP 7: 404 HANDLER
// ============================================

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/cors-test',
      'POST /api/auth/register',
      'POST /api/auth/login'
    ]
  });
});

// ============================================
// STEP 8: START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 =================================');
  console.log(`✅ SERVER STARTED ON PORT ${PORT}`);
  console.log(`🌐 CORS: FULLY ENABLED`);
  console.log(`🔓 All origins allowed: *`);
  console.log(`📡 Preflight: HANDLED`);
  console.log('🚀 =================================\n');
  
  console.log('🎯 TEST THESE ENDPOINTS:');
  console.log('   https://healthlink-kromium-backend-k5ig.onrender.com/');
  console.log('   https://healthlink-kromium-backend-k5ig.onrender.com/api/health');
  console.log('   https://healthlink-kromium-backend-k5ig.onrender.com/api/cors-test');
  console.log('');
  console.log('✅ Server is READY for CORS requests!');
});

module.exports = app;