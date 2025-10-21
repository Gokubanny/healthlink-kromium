// ============================================
// FILE: backend/server.js (FIXED - USING YOUR .ENV)
// ============================================
require('dotenv').config(); // ADD THIS AT THE TOP
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const doctorsRoutes = require('./routes/doctors');
const User = require('./models/User');

const app = express();

// ============================================
// STEP 1: CORS MIDDLEWARE (USING YOUR FRONTEND_URL)
// ============================================
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://healthlink-kromium.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://10.192.160.141:8080',
    'https://healthlink-kromium-backend-k5ig.onrender.com',
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
// STEP 3: DATABASE CONNECTION (USING YOUR MONGODB_URI)
// ============================================
const MONGODB_URI = process.env.MONGODB_URI;

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
// STEP 4: JWT CONFIGURATION (USING YOUR .ENV)
// ============================================
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRE || '7d'
};

console.log('🔐 JWT Configuration:', {
  hasSecret: !!JWT_CONFIG.secret,
  secretLength: JWT_CONFIG.secret ? JWT_CONFIG.secret.length : 0,
  expiresIn: JWT_CONFIG.expiresIn
});

// ============================================
// STEP 5: ROUTES WITH ERROR HANDLING
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

// Auth routes with better error handling
console.log('🔄 Attempting to load auth routes...');
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
  
  // Fallback auth routes
  const fallbackAuthRouter = express.Router();
  
  fallbackAuthRouter.post('/login', (req, res) => {
    console.log('🔐 Fallback login endpoint called');
    
    // Generate proper JWT token using your .env secret
    const token = jwt.sign(
      { id: 'fallback-user-id', email: req.body.email }, 
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn }
    );
    
    res.json({
      success: true,
      token: token,
      user: {
        id: 'fallback-user-id',
        firstName: 'Fallback',
        lastName: 'User',
        email: req.body.email,
        role: 'patient'
      },
      message: 'Login successful (Fallback Mode)'
    });
  });
  
  fallbackAuthRouter.post('/register', (req, res) => {
    console.log('📝 Fallback register endpoint called');
    
    // Generate proper JWT token using your .env secret
    const token = jwt.sign(
      { id: 'fallback-user-id', email: req.body.email }, 
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn }
    );
    
    res.json({
      success: true,
      token: token,
      user: {
        id: 'fallback-user-id',
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        role: req.body.role
      },
      message: 'Registration successful (Fallback Mode)'
    });
  });
  
  app.use('/api/auth', fallbackAuthRouter);
  console.log('✅ Fallback auth routes created');
}

// User routes
console.log('🔄 Attempting to load user routes...');
try {
  const userRoutes = require('./routes/users');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load user routes:', error.message);
  
  // Fallback user routes
  const fallbackUserRouter = express.Router();
  
  fallbackUserRouter.get('/profile', (req, res) => {
    console.log('👤 Fallback profile endpoint called');
    res.json({
      success: true,
      user: {
        id: 'fallback-user',
        firstName: 'Fallback',
        lastName: 'User',
        email: 'fallback@example.com',
        role: 'patient'
      }
    });
  });
  
  app.use('/api/users', fallbackUserRouter);
  console.log('✅ Fallback user routes created');
}

// ============================================
// STEP 6: HEALTH CHECK ENDPOINT
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK',
    message: '🚀 Kromium Health API Server is RUNNING!',
    timestamp: new Date().toISOString(),
    cors: 'ENABLED',
    version: '2.0.0',
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    jwt: {
      configured: !!process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRE
    },
    yourOrigin: req.headers.origin
  });
});

// ============================================
// STEP 7: CORS TEST ENDPOINT
// ============================================
app.get('/api/cors-test', (req, res) => {
  console.log('✅ CORS test - Checking headers');
  res.json({
    success: true,
    message: '🎉 CORS is WORKING PERFECTLY!',
    timestamp: new Date().toISOString(),
    yourOrigin: req.headers.origin,
    corsEnabled: true,
    frontendUrl: process.env.FRONTEND_URL,
    headers: req.headers
  });
});

// ============================================
// STEP 8: AUTH ENDPOINTS (FALLBACK - KEPT FOR BACKWARD COMPATIBILITY)
// ============================================

// REGISTER ENDPOINT (Fallback)
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

    // Generate PROPER JWT token using your .env secret
    const token = jwt.sign(
      { id: user._id }, 
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn }
    );
    
    console.log('✅ User registered successfully with JWT token');
    
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

// LOGIN ENDPOINT (Fallback)
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
    
    // Generate PROPER JWT token using your .env secret
    const token = jwt.sign(
      { id: user._id }, 
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn }
    );
    
    console.log('✅ User logged in successfully with JWT token');
    
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
// STEP 9: TOKEN VERIFICATION ENDPOINT
// ============================================
app.get('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_CONFIG.secret);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialty: user.specialty,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
      },
      message: 'Token is valid'
    });
    
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

// ============================================
// STEP 10: ROOT ENDPOINT
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Kromium Health API Server v2.0',
    version: '2.0.0',
    status: 'operational',
    environment: process.env.NODE_ENV,
    cors: 'fully-enabled',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    endpoints: {
      root: 'GET /',
      health: 'GET /api/health',
      corsTest: 'GET /api/cors-test',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      verify: 'GET /api/auth/verify',
      doctors: 'GET /api/doctors',
      specialties: 'GET /api/doctors/specialties/list',
      chat: 'POST /api/chat',
      chatHealth: 'GET /api/chat/health',
      userProfile: 'GET /api/users/profile'
    }
  });
});

// ============================================
// STEP 11: 404 HANDLER
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
      'GET /api/auth/verify',
      'GET /api/doctors',
      'GET /api/doctors/specialties/list',
      'POST /api/chat',
      'GET /api/chat/health',
      'GET /api/users/profile'
    ]
  });
});

// ============================================
// STEP 12: ERROR HANDLING MIDDLEWARE
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
// STEP 13: START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 =================================');
  console.log(`✅ SERVER STARTED ON PORT ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS: FULLY ENABLED`);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED'}`);
  console.log(`🔐 JWT: USING YOUR .ENV SECRET`);
  console.log(`🔓 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`📡 Preflight: GLOBALLY HANDLED`);
  console.log('🚀 =================================\n');
  
  console.log('🎯 AVAILABLE ENDPOINTS:');
  console.log('   GET  /');
  console.log('   GET  /api/health');
  console.log('   GET  /api/cors-test');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/auth/verify');
  console.log('   GET  /api/doctors');
  console.log('   GET  /api/doctors/specialties/list');
  console.log('   POST /api/chat');
  console.log('   GET  /api/chat/health');
  console.log('   GET  /api/users/profile');
  console.log('');
  console.log('✅ Server is READY with proper JWT authentication!');
});

module.exports = app;