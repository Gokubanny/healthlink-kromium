// ============================================
// FILE: backend/models/ChatHistory.js
// ============================================
const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for faster queries
  },
  messages: [{
    id: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update lastUpdated timestamp before saving
chatHistorySchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Limit messages to last 100 to prevent database bloat
chatHistorySchema.pre('save', function(next) {
  if (this.messages.length > 100) {
    this.messages = this.messages.slice(-100);
  }
  next();
});

// Index for efficient querying
chatHistorySchema.index({ user: 1, lastUpdated: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);