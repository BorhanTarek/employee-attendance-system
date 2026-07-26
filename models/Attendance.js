const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['check-in', 'check-out'],
    required: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  distanceFromTarget: {
    type: Number,
    required: true, // Stores computed distance from office in meters
  },
  status: {
    type: String,
    enum: ['success', 'rejected'],
    default: 'success',
  },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
