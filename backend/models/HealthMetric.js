// ============================================
// FILE: backend/models/HealthMetric.js (NEW)
// ============================================
const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One document per patient
  },
  bloodPressure: {
    type: String, // "120/80"
    required: true,
  },
  heartRate: {
    type: Number, // bpm
    required: true,
    min: 30,
    max: 200,
  },
  weight: {
    type: Number, // kg
    required: true,
    min: 20,
    max: 300,
  },
  height: {
    type: Number, // cm
    required: true,
    min: 100,
    max: 250,
  },
  bmi: {
    type: Number,
    required: true,
  },
  temperature: {
    type: Number, // Celsius
    min: 35,
    max: 42,
  },
  bloodSugar: {
    type: Number, // mg/dL
    min: 50,
    max: 300,
  },
  cholesterol: {
    total: Number,
    hdl: Number,
    ldl: Number,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
healthMetricSchema.index({ patient: 1, lastUpdated: -1 });

module.exports = mongoose.model('HealthMetric', healthMetricSchema);