// ============================================
// FILE: backend/routes/doctors.js
// ============================================
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/doctors
// @desc    Get all doctors with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { specialty, search, limit = 10, page = 1 } = req.query;

    // Build query
    let query = { role: 'doctor' };

    if (specialty && specialty !== 'all') {
      query.specialty = specialty;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const doctors = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, reviewCount: -1 });

    // Get total count
    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
      doctors,
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get single doctor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select('-password');

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/doctors/specialties/list
// @desc    Get list of all specialties
// @access  Public
router.get('/specialties/list', async (req, res) => {
  try {
    const specialties = await User.distinct('specialty', { role: 'doctor' });
    res.status(200).json({
      success: true,
      specialties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;