const User = require('../models/user');

// @desc    Get all admin users
// @route   GET /api/admin/users
// @access  Admin only
exports.getAdminUsers = async (req, res) => {
  try {
    // Find all admin users
    const adminUsers = await User.find({ role: 'ADMIN' })
      .select('name email role createdAt')
      .sort({ createdAt: -1 });

    // Get total user count
    const totalUsers = await User.countDocuments();
    const totalAdmins = adminUsers.length;

    res.json({
      success: true,
      data: {
        adminUsers,
        stats: {
          totalAdmins,
          totalUsers,
          regularUsers: totalUsers - totalAdmins
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/admin/all-users
// @access  Admin only
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
