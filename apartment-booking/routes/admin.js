const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAdminUsers, getAllUsers } = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(auth(['ADMIN']));

// @route   GET /api/admin/users
// @desc    Get all admin users
// @access  Admin only
router.get('/users', getAdminUsers);

// @route   GET /api/admin/all-users
// @desc    Get all users
// @access  Admin only
router.get('/all-users', getAllUsers);

module.exports = router;
