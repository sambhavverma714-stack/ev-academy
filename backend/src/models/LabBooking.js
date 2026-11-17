const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema({
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
  slotId: {
    type: String,
    required: true,
    index: true
  },
  bookedAt: {
    type: Date,
    default: Date.now
  },
  cancelled: {
    type: Boolean,
    default: false
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

const LabBooking = mongoose.models.LabBooking || mongoose.model('LabBooking', labBookingSchema);

module.exports = LabBooking;
