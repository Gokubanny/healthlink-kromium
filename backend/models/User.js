// ============================================
// FILE: backend/models/User.js
// ============================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  },
  phone: {
    type: String,
    trim: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  // Doctor-specific fields
  specialty: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    },
  },
  licenseNumber: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    },
  },
  yearsOfExperience: {
    type: Number,
    required: function() {
      return this.role === 'doctor';
    },
  },
  medicalSchool: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  availability: {
    monday: { enabled: Boolean, start: String, end: String },
    tuesday: { enabled: Boolean, start: String, end: String },
    wednesday: { enabled: Boolean, start: String, end: String },
    thursday: { enabled: Boolean, start: String, end: String },
    friday: { enabled: Boolean, start: String, end: String },
    saturday: { enabled: Boolean, start: String, end: String },
    sunday: { enabled: Boolean, start: String, end: String },
  },
  // Patient-specific fields
  dateOfBirth: {
    type: Date,
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
    default: '',
  },
  allergies: [{
    type: String,
  }],
  chronicConditions: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update timestamp on update
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('User', userSchema);