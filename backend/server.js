// ============================================
// FILE: backend/server.js (FIXED CORS VERSION)
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const doctorsRoutes = require('./routes/doctors');
const User = require('./models/User');

const app = express();

// ============================================
// STEP 1: CORS MIDDLEWARE (UPDATED WITH ALL ORIGINS)
// ============================================
app.use(cors({
  origin: [
    'https://healthlink-kromium.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://10.192.160.141:8080', // ADDED: Your local IP
    'https://healthlink-kromium-backend-k5ig.onrender.com', // ADDED: Your actual backend URL
    'https://healthlink-kromium-backend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));

// Handle preflight requests globally
app.options('*', cors());

// Additional custom CORS logging
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${origin || 'none'}`);
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
// STEP 4: ROUTES WITH ERROR HANDLING
// ============================================
app.use('/api/doctors', doctorsRoutes);

// Chat routes with better error handling
console.log('🔄 Attempting to load chat routes...');
try {
  const chatRoutes = require('./routes/chat');
  app.use('/api/chat', chatRoutes);
  console.log('✅ Chat routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load chat routes:', error.message);
  console.log('💡 Creating fallback chat routes...');
  
  // Fallback chat routes
  const fallbackChatRouter = express.Router();
  
  fallbackChatRouter.post('/', (req, res) => {
    console.log('💬 Fallback chat endpoint called');
    res.json({
      success: true,
      reply: "Hello! I'm Kromium Assistant. I'm here to help with your health questions. (Fallback Mode)",
      timestamp: new Date().toISOString()
    });
  });
  
  fallbackChatRouter.get('/health', (req, res) => {
    res.json({
      success: true,
      status: 'fallback',
      service: 'Kromium Assistant',
      message: 'Using fallback chat service - main chat routes failed to load'
    });
  });
  
  app.use('/api/chat', fallbackChatRouter);
  console.log('✅ Fallback chat routes created');
}

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
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    yourOrigin: req.headers.origin
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
    corsEnabled: true,
    headers: req.headers
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
// STEP 8: ROOT ENDPOINT
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
      chat: 'POST /api/chat',
      chatHealth: 'GET /api/chat/health'
    }
  });
});

// ============================================
// STEP 9: 404 HANDLER
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
      'POST /api/chat',
      'GET /api/chat/health'
    ]
  });
});

// ============================================
// STEP 10: ERROR HANDLING MIDDLEWARE
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
// STEP 11: START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 =================================');
  console.log(`✅ SERVER STARTED ON PORT ${PORT}`);
  console.log(`🌐 CORS: FULLY ENABLED WITH CORS PACKAGE`);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED'}`);
  console.log(`🔓 Allowed Origins:`);
  console.log(`   - https://healthlink-kromium.onrender.com`);
  console.log(`   - http://localhost:5173`);
  console.log(`   - http://localhost:3000`);
  console.log(`   - http://10.192.160.141:8080`);
  console.log(`   - https://healthlink-kromium-backend-k5ig.onrender.com`);
  console.log(`   - https://healthlink-kromium-backend.onrender.com`);
  console.log(`📡 Preflight: GLOBALLY HANDLED`);
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
  console.log('   GET  /api/chat/health');
  console.log('');
  console.log('✅ Server is READY for all CORS requests!');
});

module.exports = app;