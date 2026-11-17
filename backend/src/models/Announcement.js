const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
