const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String
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

// Compound index to ensure one review per user per course
reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

module.exports = Review;
