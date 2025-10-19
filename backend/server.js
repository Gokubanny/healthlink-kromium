// ============================================
// FILE: backend/server.js (UPDATED WITH ENHANCED CORS)
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const doctorsRoutes = require('./routes/doctors');
const User = require('./models/User');

const app = express();

// ============================================
// STEP 1: ENHANCED CORS MIDDLEWARE
// ============================================
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${origin || 'none'}`);
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Preflight request handled for:', req.path);
    return res.status(200).end();
  }
  
  next();
});

// ============================================
// STEP 2: Body Parsing
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// STEP 3: DATABASE CONNECTION
// ============================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://omatulemarvellous721:marvellous@cluster0.ilwg89x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
})
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// ============================================
// STEP 4: ROUTES
// ============================================
app.use('/api/doctors', doctorsRoutes);

// ============================================
// STEP 5: HEALTH CHECK ENDPOINT
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK',
    message: '🚀 Kromium Health API Server is RUNNING!',
    timestamp: new Date().toISOString(),
    cors: 'ENABLED',
    version: '2.0.0',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ============================================
// STEP 6: CORS TEST ENDPOINT
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
// STEP 7: AUTH ENDPOINTS
// ============================================

// REGISTER ENDPOINT
app.post('/api/auth/register', async (req, res) => {
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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      specialty,
      licenseNumber,
      yearsOfExperience: parseInt(yearsOfExperience) || 0,
      medicalSchool,
      isVerified: role === 'doctor'
    });

    // Generate JWT token
    const token = 'jwt-token-' + Date.now();
    
    console.log('✅ User registered successfully');
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialty: user.specialty,
        licenseNumber: user.licenseNumber,
        yearsOfExperience: user.yearsOfExperience,
        medicalSchool: user.medicalSchool,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
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
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt received');
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Mock JWT token
    const token = 'jwt-token-' + Date.now();
    
    console.log('✅ User logged in successfully');
    
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialty: user.specialty,
        licenseNumber: user.licenseNumber,
        yearsOfExperience: user.yearsOfExperience,
        medicalSchool: user.medicalSchool,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
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
// STEP 8: CHAT ENDPOINT WITH EXPLICIT CORS
// ============================================
app.post('/api/chat', async (req, res) => {
  try {
    console.log('💬 Chat request received');
    console.log('📝 Request headers:', req.headers);
    
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    console.log('📝 User message:', message);
    
    // Mock AI response
    const responses = [
      "I understand you're looking for medical assistance. How can I help you today?",
      "I'm here to help with your health questions. What symptoms are you experiencing?",
      "Thank you for reaching out. Could you tell me more about your health concern?",
      "I can provide general health information. What would you like to know?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    console.log('🤖 AI response:', randomResponse);
    
    res.json({
      success: true,
      response: randomResponse,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Chat service unavailable',
      error: error.message
    });
  }
});

// ============================================
// STEP 9: ROOT ENDPOINT
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Kromium Health API Server v2.0',
    version: '2.0.0',
    status: 'operational',
    cors: 'fully-enabled',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    endpoints: {
      root: 'GET /',
      health: 'GET /api/health',
      corsTest: 'GET /api/cors-test',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      doctors: 'GET /api/doctors',
      specialties: 'GET /api/doctors/specialties/list',
      chat: 'POST /api/chat'
    }
  });
});

// ============================================
// STEP 10: 404 HANDLER
// ============================================
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/cors-test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/doctors',
      'GET /api/doctors/specialties/list',
      'POST /api/chat'
    ]
  });
});

// ============================================
// STEP 11: ERROR HANDLING MIDDLEWARE
// ============================================
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// ============================================
// STEP 12: START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 =================================');
  console.log(`✅ SERVER STARTED ON PORT ${PORT}`);
  console.log(`🌐 CORS: FULLY ENABLED`);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED'}`);
  console.log(`🔓 All origins allowed: *`);
  console.log(`📡 Preflight: HANDLED`);
  console.log('🚀 =================================\n');
  
  console.log('🎯 AVAILABLE ENDPOINTS:');
  console.log('   GET  /');
  console.log('   GET  /api/health');
  console.log('   GET  /api/cors-test');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/doctors');
  console.log('   GET  /api/doctors/specialties/list');
  console.log('   POST /api/chat');
  console.log('');
  console.log('✅ Server is READY for all requests!');
});

module.exports = app;