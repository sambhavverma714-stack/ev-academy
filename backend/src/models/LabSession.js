const mongoose = require('mongoose');

const labSessionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  courseId: {
    type: String,
    required: true,
    index: true
  },
  labName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  startsAt: {
    type: Date,
    required: true,
    index: true
  },
  capacity: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const LabSession = mongoose.models.LabSession || mongoose.model('LabSession', labSessionSchema);

module.exports = LabSession;
