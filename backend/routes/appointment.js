// ============================================
// FILE: backend/routes/appointments.js
// ============================================
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   GET /api/appointments
// @desc    Get all appointments for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query;

    // If user is a patient, get their appointments
    if (req.user.role === 'patient') {
      query = { patient: req.user.id };
    }
    // If user is a doctor, get appointments where they are the doctor
    else if (req.user.role === 'doctor') {
      query = { doctor: req.user.id };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialty')
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialty');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if user is authorized to view this appointment
    if (
      appointment.patient._id.toString() !== req.user.id &&
      appointment.doctor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment',
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private (Patient only)
router.post(
  '/',
  [
    protect,
    authorize('patient'),
    body('doctor').notEmpty().withMessage('Doctor is required'),
    body('appointmentDate').notEmpty().withMessage('Appointment date is required'),
    body('appointmentTime').notEmpty().withMessage('Appointment time is required'),
    body('reason').notEmpty().withMessage('Reason for appointment is required'),
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

      const appointmentData = {
        patient: req.user.id,
        doctor: req.body.doctor,
        appointmentDate: req.body.appointmentDate,
        appointmentTime: req.body.appointmentTime,
        type: req.body.type,
        mode: req.body.mode,
        reason: req.body.reason,
        notes: req.body.notes,
        location: req.body.location,
      };

      const appointment = await Appointment.create(appointmentData);

      res.status(201).json({
        success: true,
        appointment,
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check authorization
    if (
      appointment.patient.toString() !== req.user.id &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment',
      });
    }

    // Fields that can be updated
    const allowedFields = [
      'appointmentDate',
      'appointmentTime',
      'status',
      'notes',
      'diagnosis',
      'prescription',
      'followUpRequired',
      'followUpDate',
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialty');

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel/Delete appointment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check authorization
    if (
      appointment.patient.toString() !== req.user.id &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this appointment',
      });
    }

    // Instead of deleting, mark as cancelled
    appointment.status = 'Cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/appointments/upcoming/list
// @desc    Get upcoming appointments
// @access  Private
router.get('/upcoming/list', protect, async (req, res) => {
  try {
    let query = { status: { $in: ['Scheduled', 'Confirmed'] } };

    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialty')
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;