const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, adminOnly } = require('../middleware/auth');
const { calculateDistance } = require('../utils/geofence');

// Target Geofence Configuration from environment variables
const TARGET_LAT = parseFloat(process.env.TARGET_LAT || '37.7749');
const TARGET_LNG = parseFloat(process.env.TARGET_LNG || '-122.4194');
const ALLOWED_RADIUS = parseFloat(process.env.ALLOWED_RADIUS || '50');

/**
 * Helper to fetch target location metadata
 */
router.get('/config', protect, (req, res) => {
  return res.json({
    targetLat: TARGET_LAT,
    targetLng: TARGET_LNG,
    allowedRadius: ALLOWED_RADIUS,
  });
});

/**
 * @route   POST /api/attendance/check-in
 * @desc    Record Employee Check-In with Server-Side Location Verification
 * @access  Private
 */
router.post('/check-in', protect, async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'GPS coordinates (latitude, longitude) are required' });
  }

  // Calculate distance between user location and target office
  const distance = calculateDistance(latitude, longitude, TARGET_LAT, TARGET_LNG);
  const isInBounds = distance <= ALLOWED_RADIUS;

  if (!isInBounds) {
    // Record rejected attempt in database for audit trail
    await Attendance.create({
      user: req.user._id,
      type: 'check-in',
      location: { latitude, longitude },
      distanceFromTarget: Math.round(distance * 10) / 10,
      status: 'rejected',
    });

    return res.status(400).json({
      message: `Check-in denied. You are ${Math.round(distance)}m away from the office. Allowed radius is ${ALLOWED_RADIUS}m.`,
      distance: Math.round(distance),
      allowedRadius: ALLOWED_RADIUS,
      isInBounds: false,
    });
  }

  // Record successful check-in
  const record = await Attendance.create({
    user: req.user._id,
    type: 'check-in',
    location: { latitude, longitude },
    distanceFromTarget: Math.round(distance * 10) / 10,
    status: 'success',
  });

  return res.status(201).json({
    message: 'Check-in successful! Have a great workday.',
    record,
    distance: Math.round(distance),
    isInBounds: true,
  });
});

/**
 * @route   POST /api/attendance/check-out
 * @desc    Record Employee Check-Out with Server-Side Location Verification
 * @access  Private
 */
router.post('/check-out', protect, async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'GPS coordinates (latitude, longitude) are required' });
  }

  const distance = calculateDistance(latitude, longitude, TARGET_LAT, TARGET_LNG);
  const isInBounds = distance <= ALLOWED_RADIUS;

  if (!isInBounds) {
    await Attendance.create({
      user: req.user._id,
      type: 'check-out',
      location: { latitude, longitude },
      distanceFromTarget: Math.round(distance * 10) / 10,
      status: 'rejected',
    });

    return res.status(400).json({
      message: `Check-out denied. You are ${Math.round(distance)}m away from the office. Allowed radius is ${ALLOWED_RADIUS}m.`,
      distance: Math.round(distance),
      allowedRadius: ALLOWED_RADIUS,
      isInBounds: false,
    });
  }

  const record = await Attendance.create({
    user: req.user._id,
    type: 'check-out',
    location: { latitude, longitude },
    distanceFromTarget: Math.round(distance * 10) / 10,
    status: 'success',
  });

  return res.status(201).json({
    message: 'Check-out successful! See you tomorrow.',
    record,
    distance: Math.round(distance),
    isInBounds: true,
  });
});

/**
 * @route   GET /api/attendance/my-status
 * @desc    Get user's latest attendance status for today
 * @access  Private
 */
router.get('/my-status', protect, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayRecords = await Attendance.find({
      user: req.user._id,
      timestamp: { $gte: startOfDay, $lte: endOfDay },
      status: 'success',
    }).sort({ timestamp: -1 });

    const latestPunch = todayRecords[0] || null;

    return res.json({
      latestPunch,
      isCheckedIn: latestPunch ? latestPunch.type === 'check-in' : false,
      todayRecords,
    });
  } catch (error) {
    console.error('Error fetching my-status:', error);
    return res.status(500).json({ message: 'Error fetching today status' });
  }
});

/**
 * @route   GET /api/attendance/logs
 * @desc    Get all attendance logs with filtering (Admin only)
 * @access  Private/Admin
 */
router.get('/logs', protect, adminOnly, async (req, res) => {
  try {
    const { date, userId, status } = req.query;
    let query = {};

    if (userId) {
      query.user = userId;
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      query.timestamp = { $gte: startOfDay, $lte: endOfDay };
    }

    const logs = await Attendance.find(query)
      .populate('user', 'name email employeeId role')
      .sort({ timestamp: -1 });

    return res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ message: 'Server error fetching attendance logs' });
  }
});

module.exports = router;
