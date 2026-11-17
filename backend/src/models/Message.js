const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['contact', 'password-reset'],
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  handled: {
    type: Boolean,
    default: false
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

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

module.exports = Message;
