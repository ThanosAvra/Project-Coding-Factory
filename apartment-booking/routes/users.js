// routes/users.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateUserProfile, getUsers, promoteToAdmin, createFirstAdmin } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// @route   POST /api/users/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   POST /api/users/create-admin
// @desc    Create first admin user (only if no admins exist)
// @access  Public (but only works if no admins exist)
router.post('/create-admin', createFirstAdmin);

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth(), getMe);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth(), updateUserProfile);

// @route   PUT /api/users/promote/:id
// @desc    Promote user to admin
// @access  Private/Admin
router.put('/promote/:id', auth(['ADMIN']), promoteToAdmin);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', auth(['ADMIN']), getUsers);

module.exports = router;