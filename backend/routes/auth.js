// ============================================
// FILE: backend/routes/auth.js (UPDATED)
// ============================================
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Simple test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth route is working!'
  });
});

// @route   GET /api/auth/me
// @desc    Get current user (protected route example)
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // For now, this is a public endpoint for testing
    // In production, you'd add the protect middleware
    res.json({
      success: true,
      message: 'Auth me endpoint is working',
      user: null // You'd get this from the token
    });
  } catch (error) {
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
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
      });
    } catch (error) {
      console.error('Registration error:', error);
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Check for user with password
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Generate token
      const token = generateToken(user._id);

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
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: process.env.NODE_ENV === 'production' ? {} : error.message
      });
    }
  }
);

module.exports = router;