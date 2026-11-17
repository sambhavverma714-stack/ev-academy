const mongoose = require('mongoose');

const coursePriceSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  price: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const CoursePrice = mongoose.models.CoursePrice || mongoose.model('CoursePrice', coursePriceSchema);

module.exports = CoursePrice;
