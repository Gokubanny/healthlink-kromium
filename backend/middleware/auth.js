// ============================================
// FILE: backend/middleware/auth.js (FIXED TOKEN HANDLING)
// ============================================
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  console.log('🔐 Auth middleware checking request...');

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('✅ Token found in Authorization header');
  }

  // Make sure token exists
  if (!token) {
    console.log('❌ No token provided in request');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route - no token provided',
    });
  }

  try {
    console.log('🔍 Verifying token...');
    
    // Verify token USING YOUR .ENV SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified for user ID:', decoded.id);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('❌ User not found for token');
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Add user to request
    req.user = user;
    console.log(`✅ User authenticated: ${user.firstName} ${user.lastName} (${user.role})`);

    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    let errorMessage = 'Not authorized to access this route';
    
    if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token expired';
    }

    return res.status(401).json({
      success: false,
      message: errorMessage,
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - no user data',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    
    console.log(`✅ Role authorized: ${req.user.role}`);
    next();
  };
};