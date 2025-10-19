// ============================================
// FILE: backend/routes/users.js
// ============================================
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      profilePicture: req.body.profilePicture,
    };

    // Add doctor-specific fields if user is a doctor
    if (req.user.role === 'doctor') {
      if (req.body.specialty) fieldsToUpdate.specialty = req.body.specialty;
      if (req.body.yearsOfExperience) fieldsToUpdate.yearsOfExperience = req.body.yearsOfExperience;
      if (req.body.medicalSchool) fieldsToUpdate.medicalSchool = req.body.medicalSchool;
    }

    // Add patient-specific fields if user is a patient
    if (req.user.role === 'patient') {
      if (req.body.dateOfBirth) fieldsToUpdate.dateOfBirth = req.body.dateOfBirth;
      if (req.body.bloodType) fieldsToUpdate.bloodType = req.body.bloodType;
      if (req.body.allergies) fieldsToUpdate.allergies = req.body.allergies;
      if (req.body.chronicConditions) fieldsToUpdate.chronicConditions = req.body.chronicConditions;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   PUT /api/users/availability
// @desc    Update doctor availability schedule
// @access  Private (Doctors only)
router.put('/availability', protect, authorize('doctor'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { availability: req.body.availability },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;