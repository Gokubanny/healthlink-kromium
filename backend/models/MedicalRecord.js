// ============================================
// FILE: backend/models/MedicalRecord.js
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
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    title: {
      type: String,
      required: [true, 'Please provide record title'],
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
    },
    findings: {
      type: String,
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
      uploadDate: Date,
    }],
    notes: {
      type: String,
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
  medicalRecordSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
  });
  
  // Index for faster queries
  medicalRecordSchema.index({ patient: 1, date: -1 });
  
  module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);