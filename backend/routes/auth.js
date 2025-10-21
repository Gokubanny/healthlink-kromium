// ============================================
// FILE: backend/routes/auth.js (FIXED TOKEN GENERATION)
// ============================================
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-for-development';
  const expiresIn = process.env.JWT_EXPIRE || '30d';
  
  console.log('🔐 Generating token for user:', id);
  const token = jwt.sign({ id }, secret, { expiresIn });
  
  console.log('✅ Token generated successfully, expires in:', expiresIn);
  return token;
};

// Simple test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth route is working!',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // This would normally be protected, but for testing we'll make it public
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(404).json({
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
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role').isIn(['patient', 'doctor']).withMessage('Role must be either patient or doctor'),
  ],
  async (req, res) => {
    try {
      console.log('📝 Registration attempt received:', {
        email: req.body.email,
        role: req.body.role,
        firstName: req.body.firstName
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { 
        firstName, 
        lastName, 
        email, 
        password, 
        role, 
        phone,
        specialty,
        licenseNumber, 
        yearsOfExperience,
        medicalSchool
      } = req.body;

      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        console.log('❌ User already exists:', email);
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      // Create user data
      const userData = {
        firstName,
        lastName,
        email,
        password,
        role,
        phone: phone || '',
      };

      // Add doctor-specific fields if role is doctor
      if (role === 'doctor') {
        if (!specialty || !licenseNumber || !yearsOfExperience || !medicalSchool) {
          return res.status(400).json({
            success: false,
            message: 'All doctor verification fields are required',
          });
        }
        
        userData.specialty = specialty;
        userData.licenseNumber = licenseNumber;
        userData.yearsOfExperience = yearsOfExperience;
        userData.medicalSchool = medicalSchool;
        userData.isVerified = true; // Auto-verify doctors
        userData.rating = 5.0;
        userData.reviewCount = 0;
      }

      // Create user
      const user = await User.create(userData);
      console.log('✅ User created in database:', user._id);

      // Generate token
      const token = generateToken(user._id);

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
          profilePicture: user.profilePicture,
          isVerified: user.isVerified,
        },
        message: 'User registered successfully!'
      });
      
      console.log('🎉 Registration completed successfully for:', email);
    } catch (error) {
      console.error('❌ Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: process.env.NODE_ENV === 'production' ? {} : error.message
      });
    }
  }
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      console.log('🔐 Login attempt received for:', req.body.email);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Login validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Check for user with password
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        console.log('❌ User not found:', email);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        console.log('❌ Password mismatch for:', email);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Generate token
      const token = generateToken(user._id);

      console.log('✅ Login successful for:', email);

      res.status(200).json({
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
          profilePicture: user.profilePicture,
          isVerified: user.isVerified,
        },
        message: 'Login successful!'
      });
    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: process.env.NODE_ENV === 'production' ? {} : error.message
      });
    }
  }
);

module.exports = router;