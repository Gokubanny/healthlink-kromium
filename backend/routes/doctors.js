// ============================================
// FILE: backend/routes/doctors.js (FIXED)
// ============================================
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    console.log('🔍 [DOCTORS API] Starting doctors query...');
    
    // Import User inside the function to avoid circular dependencies
    const User = require('../models/User');
    
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
      .sort({ createdAt: -1 }); // Simpler sort for now

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
      message: 'Server error: ' + error.message,
    });
  }
});

router.get('/specialties/list', async (req, res) => {
  try {
    console.log('🔍 [SPECIALTIES API] Fetching specialties...');
    
    // Import User inside the function to avoid circular dependencies
    const User = require('../models/User');
    
    const specialties = await User.distinct('specialty', { role: 'doctor' });
    
    console.log(`✅ [SPECIALTIES API] Found specialties:`, specialties);
    
    res.status(200).json({
      success: true,
      specialties: specialties || [],
    });
  } catch (error) {
    console.error('❌ [SPECIALTIES API] Error fetching specialties:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const User = require('../models/User');
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

module.exports = router;