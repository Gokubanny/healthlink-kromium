// ============================================
// FILE: backend/routes/medicalRecords.js
// ============================================
const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/medical-records
// @desc    Get all medical records for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query;

    // Patients can only see their own records
    if (req.user.role === 'patient') {
      query = { patient: req.user.id };
    }
    // Doctors can see records they created
    else if (req.user.role === 'doctor') {
      query = { doctor: req.user.id };
    }

    const records = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName specialty')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/medical-records/:id
// @desc    Get single medical record
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName specialty');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    // Check authorization
    if (
      record.patient._id.toString() !== req.user.id &&
      record.doctor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this record',
      });
    }

    res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/medical-records
// @desc    Create new medical record
// @access  Private (Doctor only)
router.post('/', protect, authorize('doctor'), async (req, res) => {
  try {
    const recordData = {
      patient: req.body.patient,
      doctor: req.user.id,
      title: req.body.title,
      type: req.body.type,
      date: req.body.date || Date.now(),
      description: req.body.description,
      findings: req.body.findings,
      labResults: req.body.labResults,
      vitals: req.body.vitals,
      medications: req.body.medications,
      notes: req.body.notes,
      appointment: req.body.appointment,
    };

    const record = await MedicalRecord.create(recordData);

    res.status(201).json({
      success: true,
      record,
    });
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   PUT /api/medical-records/:id
// @desc    Update medical record
// @access  Private (Doctor only)
router.put('/:id', protect, authorize('doctor'), async (req, res) => {
  try {
    let record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    // Only the doctor who created the record can update it
    if (record.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this record',
      });
    }

    record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName specialty');

    res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   DELETE /api/medical-records/:id
// @desc    Delete medical record
// @access  Private (Doctor only)
router.delete('/:id', protect, authorize('doctor'), async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    // Only the doctor who created the record can delete it
    if (record.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this record',
      });
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Medical record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/medical-records/patient/:patientId
// @desc    Get all medical records for a specific patient
// @access  Private (Doctor only)
router.get('/patient/:patientId', protect, authorize('doctor'), async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName specialty')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
