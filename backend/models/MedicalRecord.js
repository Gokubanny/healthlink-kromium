// ============================================
// FILE: backend/models/MedicalRecord.js (UPDATED)
// ============================================
const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required for patient-uploaded records
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  title: {
    type: String,
    required: [true, 'Please provide record title'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['Lab Report', 'Checkup Report', 'Imaging', 'Prescription', 'Immunization', 'Other'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
  },
  findings: {
    type: String,
    trim: true,
  },
  // Test results
  labResults: [{
    testName: String,
    result: String,
    unit: String,
    normalRange: String,
  }],
  // Vital signs
  vitals: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    bmi: Number,
  },
  // Medications prescribed
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    startDate: Date,
    endDate: Date,
  }],
  // File attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],
  notes: {
    type: String,
    trim: true,
  },
  isPatientUploaded: {
    type: Boolean,
    default: false,
  },
  isConfidential: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on update
medicalRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

medicalRecordSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Index for faster queries
medicalRecordSchema.index({ patient: 1, date: -1 });
medicalRecordSchema.index({ doctor: 1, date: -1 });
medicalRecordSchema.index({ isPatientUploaded: 1 });
medicalRecordSchema.index({ type: 1 });

// Virtual for formatted date
medicalRecordSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Ensure virtual fields are serialized
medicalRecordSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);