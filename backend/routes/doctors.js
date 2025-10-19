// ============================================
// FILE: backend/routes/doctors.js (UPDATED WITH DEBUGGING)
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

    console.log('🔍 [DOCTORS API] Query parameters:', { specialty, search, limit, page });

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

    console.log('🔍 [DOCTORS API] Final MongoDB query:', JSON.stringify(query));

    // Execute query with pagination
    const doctors = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, reviewCount: -1 });

    // Get total count
    const count = await User.countDocuments(query);

    console.log(`✅ [DOCTORS API] Found ${doctors.length} doctors out of ${count} total`);
    
    // Log each doctor found
    if (doctors.length > 0) {
      console.log('👨‍⚕️ [DOCTORS API] Doctors found:');
      doctors.forEach((doctor, index) => {
        console.log(`  ${index + 1}. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialty} - Role: ${doctor.role}`);
      });
    } else {
      console.log('❌ [DOCTORS API] No doctors found in database');
      
      // Let's check what users actually exist in the database
      const allUsers = await User.find({}).select('firstName lastName role specialty');
      console.log('📊 [DOCTORS API] All users in database:');
      allUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} - Role: ${user.role} - Specialty: ${user.specialty}`);
      });
    }

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
    console.error('❌ [DOCTORS API] Error fetching doctors:', error);
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
    console.log('🔍 [SPECIALTIES API] Fetching specialties...');
    
    const specialties = await User.distinct('specialty', { role: 'doctor' });
    
    console.log(`✅ [SPECIALTIES API] Found specialties:`, specialties);
    
    res.status(200).json({
      success: true,
      specialties,
    });
  } catch (error) {
    console.error('❌ [SPECIALTIES API] Error fetching specialties:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;