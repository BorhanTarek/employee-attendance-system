const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

/**
 * @route   POST /api/users/create
 * @desc    Create a new employee account (Admin only)
 * @access  Private/Admin
 */
router.post('/create', protect, adminOnly, async (req, res) => {
  const { name, email, employeeId, password, role } = req.body;

  if (!name || !email || !employeeId || !password) {
    return res.status(400).json({ message: 'All fields (name, email, employeeId, password) are required' });
  }

  try {
    const userExists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeId }],
    });

    if (userExists) {
      return res.status(400).json({ message: 'User with this Email or Employee ID already exists' });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      employeeId,
      password,
      role: role || 'Employee',
    });

    await newUser.save();

    return res.status(201).json({
      message: 'Employee account created successfully',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        employeeId: newUser.employeeId,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Server error creating user' });
  }
});

/**
 * @route   GET /api/users/list
 * @desc    Get all users list (Admin only)
 * @access  Private/Admin
 */
router.get('/list', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error fetching user list' });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user account (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Admin') {
      return res.status(400).json({ message: 'Cannot delete Admin accounts' });
    }

    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Server error deleting user' });
  }
});

module.exports = router;
