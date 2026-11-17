const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true
  },
  correct: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  submittedAt: {
    type: Date,
    required: true
  }
}, { _id: false });

const courseProgressSchema = new mongoose.Schema({
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
  completedModules: [{
    type: String
  }],
  attempts: [attemptSchema],
  passed: {
    type: Boolean,
    default: false
  },
  passedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one progress record per user per course
courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const CourseProgress = mongoose.models.CourseProgress || mongoose.model('CourseProgress', courseProgressSchema);

module.exports = CourseProgress;
