const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  courseId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'paid'],
    default: 'created',
    index: true
  },
  method: {
    type: String,
    enum: ['demo', 'razorpay'],
    required: true
  },
  paymentMethod: {
    type: String
  },
  orderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

module.exports = Payment;
