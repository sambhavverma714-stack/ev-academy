const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  courseId: {
    type: String,
    required: true,
    index: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  issuedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  signature: {
    type: String,
    required: true
  },
  revoked: {
    type: Boolean,
    default: false
  },
  revokedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
