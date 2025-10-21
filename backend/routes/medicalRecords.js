// ============================================
// FILE: backend/routes/medicalRecords.js (UPDATED WITH PATIENT UPLOAD)
// ============================================
const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/medical-records/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'record-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, images (JPG, JPEG, PNG), and document files (DOC, DOCX) are allowed'));
    }
  },
});

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

// @route   GET /api/medical-records/my-records
// @desc    Get medical records for logged in patient
// @access  Private
router.get('/my-records', protect, async (req, res) => {
  try {
    // Only patients can access their own records via this endpoint
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Patients only.',
      });
    }

    const records = await MedicalRecord.find({ patient: req.user.id })
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
    // Patients can view their own records, doctors can view records they created
    if (
      record.patient._id.toString() !== req.user.id &&
      record.doctor._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
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
    console.error('Error fetching medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/medical-records
// @desc    Create new medical record (Doctor only)
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

    // Populate the response
    await record.populate('patient', 'firstName lastName email');
    await record.populate('doctor', 'firstName lastName specialty');

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

// @route   POST /api/medical-records/patient-upload
// @desc    Patient uploads their own medical record
// @access  Private (Patient only)
router.post('/patient-upload', protect, authorize('patient'), upload.single('file'), async (req, res) => {
  try {
    const { title, type, date, description } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Record title is required',
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Record type is required',
      });
    }

    const recordData = {
      patient: req.user.id,
      title: title.trim(),
      type: type,
      date: date || new Date(),
      description: description || '',
      isPatientUploaded: true, // Flag to identify patient-uploaded records
    };

    // If file was uploaded, add to attachments
    if (req.file) {
      recordData.attachments = [{
        fileName: req.file.originalname,
        fileUrl: `/uploads/medical-records/${req.file.filename}`,
        fileType: req.file.mimetype,
        uploadDate: new Date(),
      }];
    }

    const record = await MedicalRecord.create(recordData);

    // Populate patient info for response
    await record.populate('patient', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Medical record added successfully',
      record,
    });
  } catch (error) {
    console.error('Error creating medical record:', error);
    
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.',
        });
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
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
    console.error('Error updating medical record:', error);
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

    // Delete associated files if any
    if (record.attachments && record.attachments.length > 0) {
      record.attachments.forEach(attachment => {
        const filePath = path.join(__dirname, '..', attachment.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Medical record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   DELETE /api/medical-records/patient/:id
// @desc    Delete patient-uploaded medical record
// @access  Private (Patient only)
router.delete('/patient/:id', protect, authorize('patient'), async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    // Patients can only delete their own uploaded records
    if (record.patient.toString() !== req.user.id || !record.isPatientUploaded) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this record',
      });
    }

    // Delete associated files if any
    if (record.attachments && record.attachments.length > 0) {
      record.attachments.forEach(attachment => {
        const filePath = path.join(__dirname, '..', attachment.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Medical record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/medical-records/patient/:patientId
// @desc    Get all medical records for a specific patient (Doctor view)
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
    console.error('Error fetching patient medical records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/medical-records/types/count
// @desc    Get count of medical records by type for current patient
// @access  Private
router.get('/types/count', protect, async (req, res) => {
  try {
    const counts = await MedicalRecord.aggregate([
      { $match: { patient: req.user._id } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      counts,
    });
  } catch (error) {
    console.error('Error fetching record type counts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/medical-records/recent/:limit?
// @desc    Get recent medical records
// @access  Private
router.get('/recent/:limit?', protect, async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 5;
    
    const records = await MedicalRecord.find({ patient: req.user.id })
      .populate('doctor', 'firstName lastName specialty')
      .sort({ date: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error('Error fetching recent medical records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;