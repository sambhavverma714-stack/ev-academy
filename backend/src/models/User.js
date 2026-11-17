const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    default: 'student'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verifyTokenHash: {
    type: String,
    select: false
  },
  verifyExpires: {
    type: Date,
    select: false
  },
  verifyLastSentAt: {
    type: Date,
    select: false
  },
  resetTokenHash: {
    type: String,
    select: false
  },
  resetExpires: {
    type: Date,
    select: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent model recompilation in development
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
