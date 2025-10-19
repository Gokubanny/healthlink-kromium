// ============================================
// FILE: backend/server.js (ENHANCED CORS SOLUTION)
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables FIRST
dotenv.config();

const app = express();

// ============================================
// STEP 1: ENHANCED CORS MIDDLEWARE
// ============================================

// More comprehensive CORS handling
app.use((req, res, next) => {
  // Allow specific origins in production, all in development
  const allowedOrigins = [
    'https://healthlink-kromium.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  const requestOrigin = allowedOrigins.includes(origin) ? origin : '*';
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Requested-With, Content-Range, Content-Disposition, Content-Description');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Enhanced logging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${origin || 'none'}`);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Preflight request handled successfully');
    return res.status(200).end();
  }
  
  next();
});

// ============================================
// STEP 2: Security & Body Parsing
// ============================================

// Configure helmet to not interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (relaxed for testing)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// ============================================
// STEP 3: Database Connection
// ============================================

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected:', mongoose.connection.name);
})
.catch((err) => {
  console.error('❌ MongoDB Error:', err.message);
  process.exit(1);
});

// ============================================
// STEP 4: Import Routes (after CORS is set up)
// ============================================

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const appointmentRoutes = require('./routes/appointment');
const doctorRoutes = require('./routes/doctors');
const medicalRecordRoutes = require('./routes/medicalRecords');
const chatRoutes = require('./routes/chat');
const errorHandler = require('./middleware/errorHandler');

// ============================================
// STEP 5: API Routes
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    cors: 'enabled'
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    corsHeaders: {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Kromium Health API',
    version: '1.0.0',
    status: 'operational'
  });
});

// ============================================
// STEP 6: Error Handlers
// ============================================

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ============================================
// STEP 7: Start Server
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 =================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔓 CORS: ENHANCED CONFIGURATION`);
  console.log(`📡 Listening on: 0.0.0.0:${PORT}`);
  console.log('🚀 =================================\n');
});

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;