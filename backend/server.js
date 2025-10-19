// ============================================
// FILE: backend/server.js (ULTIMATE CORS SOLUTION)
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Load environment variables FIRST
dotenv.config();

const app = express();

// ============================================
// STEP 1: ULTIMATE CORS CONFIGURATION
// ============================================

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://healthlink-kromium.onrender.com',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://healthlink-kromium-frontend.onrender.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🔒 CORS Blocked Origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Access-Token',
    'X-Key',
    'Content-Range',
    'Content-Disposition',
    'Content-Description'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'Content-Disposition',
    'Content-Description'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight for all routes
app.options('*', cors(corsOptions));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// ============================================
// STEP 2: Security & Body Parsing
// ============================================

// Configure helmet to not interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
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
    cors: 'enabled',
    origin: req.headers.origin
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    corsEnabled: true,
    headers: req.headers
  });
});

// Test preflight specifically
app.options('/api/cors-test', cors(corsOptions));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Kromium Health API',
    version: '1.0.0',
    status: 'operational',
    cors: 'enabled'
  });
});

// ============================================
// STEP 6: Error Handlers
// ============================================

app.use(errorHandler);

// CORS error handler
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy: Origin not allowed',
      allowedOrigins: [
        'https://healthlink-kromium.onrender.com',
        'http://localhost:3000',
        'http://localhost:5173'
      ]
    });
  }
  next(err);
});

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
  console.log(`🔓 CORS: ULTIMATE CONFIGURATION`);
  console.log(`📡 Allowed Origins:`);
  console.log(`   - https://healthlink-kromium.onrender.com`);
  console.log(`   - http://localhost:3000`);
  console.log(`   - http://localhost:5173`);
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