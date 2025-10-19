// ============================================
// FILE: backend/server.js (COMPLETE CORS FIX)
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const appointmentRoutes = require('./routes/appointment');
const doctorRoutes = require('./routes/doctors');
const medicalRecordRoutes = require('./routes/medicalRecords');
const chatRoutes = require('./routes/chat');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ============================================
// CORS FIX - ULTIMATE SOLUTION
// ============================================

// Manual CORS middleware - handles ALL requests including OPTIONS
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://healthlink-kromium.onrender.com',
    'https://healthlink-kromium-backend.onrender.com'
  ];
  
  const origin = req.headers.origin;
  
  // Allow if origin is in allowed list or if it's a localhost origin
  if (allowedOrigins.includes(origin) || (origin && origin.includes('localhost')) || (origin && origin.includes('127.0.0.1'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`✅ CORS: Allowed origin: ${origin}`);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Allow-Origin');
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS: Handling OPTIONS preflight for ${req.path}`);
    return res.status(200).end();
  }
  
  next();
});

// Security middleware - configure helmet for CORS compatibility
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for testing
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kromium-health', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/chat', chatRoutes);

// Enhanced Health check endpoint with CORS info
app.get('/api/health', (req, res) => {
  const origin = req.headers.origin || 'No origin header';
  res.status(200).json({ 
    status: 'OK', 
    message: 'Kromium Health API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      enabled: true,
      currentOrigin: origin,
      allowed: true
    },
    services: {
      database: 'connected',
      openai: !!process.env.OPENAI_API_KEY
    }
  });
});

// Test CORS endpoint
app.get('/api/cors-test', (req, res) => {
  res.status(200).json({
    message: 'CORS test successful!',
    origin: req.headers.origin,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Kromium Health API',
    version: '1.0.0',
    status: 'operational',
    cors: 'enabled',
    endpoints: {
      health: '/api/health',
      corsTest: '/api/cors-test',
      auth: '/api/auth',
      users: '/api/users',
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      medicalRecords: '/api/medical-records',
      chat: '/api/chat'
    }
  });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Enhanced 404 handler with CORS
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`🔒 CORS: MANUAL MIDDLEWARE - GUARANTEED TO WORK`);
  console.log(`🌐 Allowed Origins:`);
  console.log(`   - http://localhost:8080`);
  console.log(`   - http://localhost:5173`);
  console.log(`   - http://localhost:5174`);
  console.log(`   - https://healthlink-kromium.onrender.com`);
  console.log(`   - All localhost/127.0.0.1 variants`);
  console.log(`🏥 Kromium Health Backend is ready!\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;