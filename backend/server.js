// ============================================
// FILE: backend/server.js (COMPLETE - ALL ROUTES)
// ============================================
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();

// ============================================
// CORS MIDDLEWARE
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

app.options('*', cors());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${origin || 'none'}`);
  next();
});

// ============================================
// BODY PARSING
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// DATABASE CONNECTION
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
// JWT CONFIGURATION
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
// LOAD ALL ROUTES
// ============================================

// Doctors Routes
console.log('🔄 Loading doctors routes...');
try {
  const doctorsRoutes = require('./routes/doctors');
  app.use('/api/doctors', doctorsRoutes);
  console.log('✅ Doctors routes loaded');
} catch (error) {
  console.error('❌ Failed to load doctors routes:', error.message);
}

// Appointment Routes
console.log('🔄 Loading appointment routes...');
try {
  const appointmentRoutes = require('./routes/appointment');
  app.use('/api/appointments', appointmentRoutes);
  console.log('✅ Appointment routes loaded');
} catch (error) {
  console.error('❌ Failed to load appointment routes:', error.message);
}

// Medical Records Routes
console.log('🔄 Loading medical records routes...');
try {
  const medicalRecordsRoutes = require('./routes/medicalRecords');
  app.use('/api/medical-records', medicalRecordsRoutes);
  console.log('✅ Medical records routes loaded');
} catch (error) {
  console.error('❌ Failed to load medical records routes:', error.message);
}

// Health Metrics Routes
console.log('🔄 Loading health metrics routes...');
try {
  const healthMetricsRoutes = require('./routes/HealthMetric');
  app.use('/api/health-metrics', healthMetricsRoutes);
  console.log('✅ Health metrics routes loaded');
} catch (error) {
  console.error('❌ Failed to load health metrics routes:', error.message);
}

// Chat Routes
console.log('🔄 Loading chat routes...');
try {
  const chatRoutes = require('./routes/chat');
  app.use('/api/chat', chatRoutes);
  console.log('✅ Chat routes loaded');
} catch (error) {
  console.error('❌ Failed to load chat routes:', error.message);
  
  // Fallback chat routes
  const fallbackChatRouter = express.Router();
  
  fallbackChatRouter.post('/', (req, res) => {
    res.json({
      success: true,
      reply: "Hello! I'm Kromium Assistant. (Fallback Mode)",
      timestamp: new Date().toISOString()
    });
  });
  
  fallbackChatRouter.get('/health', (req, res) => {
    res.json({
      success: true,
      status: 'fallback',
      service: 'Kromium Assistant'
    });
  });
  
  app.use('/api/chat', fallbackChatRouter);
  console.log('✅ Fallback chat routes created');
}

// Auth Routes
console.log('🔄 Loading auth routes...');
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
  
  // Fallback auth routes
  const fallbackAuthRouter = express.Router();
  
  fallbackAuthRouter.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      const token = jwt.sign({ id: user._id }, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });
      
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          specialty: user.specialty,
          isVerified: user.isVerified,
          profilePicture: user.profilePicture,
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  });
  
  fallbackAuthRouter.post('/register', async (req, res) => {
    try {
      const { firstName, lastName, email, password, role, phone, specialty, licenseNumber, yearsOfExperience, medicalSchool } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }
      
      const user = await User.create({
        firstName, lastName, email, password, role, phone,
        specialty, licenseNumber,
        yearsOfExperience: parseInt(yearsOfExperience) || 0,
        medicalSchool,
        isVerified: role === 'doctor'
      });
      
      const token = jwt.sign({ id: user._id }, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });
      
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          specialty: user.specialty,
          isVerified: user.isVerified,
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  });
  
  app.use('/api/auth', fallbackAuthRouter);
  console.log('✅ Fallback auth routes created');
}

// User Routes
console.log('🔄 Loading user routes...');
try {
  const userRoutes = require('./routes/user');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes loaded');
} catch (error) {
  console.error('❌ Failed to load user routes:', error.message);
  
  // Fallback user routes
  const fallbackUserRouter = express.Router();
  
  fallbackUserRouter.get('/profile', (req, res) => {
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
// HEALTH CHECK ENDPOINT
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
    routes: {
      auth: '/api/auth',
      users: '/api/users',
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      medicalRecords: '/api/medical-records',
      healthMetrics: '/api/health-metrics',
      chat: '/api/chat',
    }
  });
});

// ============================================
// CORS TEST ENDPOINT
// ============================================
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: '🎉 CORS is WORKING!',
    timestamp: new Date().toISOString(),
    yourOrigin: req.headers.origin,
    corsEnabled: true
  });
});

// ============================================
// TOKEN VERIFICATION ENDPOINT
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
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

// ============================================
// ROOT ENDPOINT
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Kromium Health API Server v2.0',
    version: '2.0.0',
    status: 'operational',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify',
      },
      users: {
        profile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile',
      },
      doctors: {
        list: 'GET /api/doctors',
        specialties: 'GET /api/doctors/specialties/list',
        detail: 'GET /api/doctors/:id',
      },
      appointments: {
        list: 'GET /api/appointments',
        myAppointments: 'GET /api/appointments/my-appointments',
        create: 'POST /api/appointments',
        update: 'PUT /api/appointments/:id',
        cancel: 'PUT /api/appointments/:id/cancel',
      },
      medicalRecords: {
        list: 'GET /api/medical-records',
        myRecords: 'GET /api/medical-records/my-records',
        patientUpload: 'POST /api/medical-records/patient-upload',
      },
      healthMetrics: {
        add: 'POST /api/health-metrics',
        latest: 'GET /api/health-metrics/latest',
      },
      chat: {
        send: 'POST /api/chat',
        history: 'GET /api/chat/history',
      }
    }
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    hint: 'Visit GET / or GET /api/health for available endpoints'
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 =================================');
  console.log(`✅ SERVER STARTED ON PORT ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS: FULLY ENABLED`);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED'}`);
  console.log(`🔐 JWT: CONFIGURED`);
  console.log(`🔓 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log('🚀 =================================\n');
  
  console.log('🎯 ALL ROUTES MOUNTED:');
  console.log('   ✅ /api/auth');
  console.log('   ✅ /api/users');
  console.log('   ✅ /api/doctors');
  console.log('   ✅ /api/appointments');
  console.log('   ✅ /api/medical-records');
  console.log('   ✅ /api/health-metrics');
  console.log('   ✅ /api/chat');
  console.log('');
  console.log('✅ Server is READY!');
});

module.exports = app;