// ============================================
// FILE: backend/models/Appointment.js
// ============================================
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  appointmentDate: {
    type: Date,
    required: [true, 'Please provide appointment date'],
  },
  appointmentTime: {
    type: String,
    required: [true, 'Please provide appointment time'],
  },
  type: {
    type: String,
    enum: ['Consultation', 'Follow-up', 'Routine Checkup', 'Emergency', 'Other'],
    default: 'Consultation',
  },
  mode: {
    type: String,
    enum: ['In-person', 'Video Call', 'Phone Call'],
    default: 'In-person',
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-show'],
    default: 'Scheduled',
  },
  reason: {
    type: String,
    required: [true, 'Please provide reason for appointment'],
  },
  notes: {
    type: String,
  },
  location: {
    type: String,
  },
  // For video consultations
  meetingLink: {
    type: String,
  },
  // Prescription and diagnosis (added after consultation)
  diagnosis: {
    type: String,
  },
  prescription: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
  }],
  followUpRequired: {
    type: Boolean,
    default: false,
  },
  followUpDate: {
    type: Date,
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
appointmentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);