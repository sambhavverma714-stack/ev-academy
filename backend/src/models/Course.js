const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: [{
    type: String
  }],
  preview: {
    type: Boolean,
    default: false
  },
  figures: [{
    after: Number,
    src: String,
    alt: String,
    caption: String,
    video: String
  }]
}, { _id: false });

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  answer: {
    type: Number,
    required: true
  }
}, { _id: false });

const courseSchema = new mongoose.Schema({
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
  level: {
    type: String,
    required: true
  },
  hours: {
    type: Number,
    required: true
  },
  passingScore: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  modules: [moduleSchema],
  assessment: [questionSchema],
  price: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

module.exports = Course;
