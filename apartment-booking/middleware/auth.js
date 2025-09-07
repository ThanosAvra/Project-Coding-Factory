const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Middleware για έλεγχο JWT και (προαιρετικά) ρόλων.
 * Χρήση:
 *   auth()            -> για όλους τους logged-in
 *   auth(['ADMIN'])   -> μόνο admin
 */
const auth = (roles = []) => {
  // αν δοθεί string, το κάνουμε array
  if (typeof roles === 'string') roles = [roles];

  return async (req, res, next) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not set in environment variables');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user; // JWT payload contains { user: { id, role } }

      // Αν έχουν οριστεί ρόλοι, ελέγχουμε πρόσβαση
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    } catch (err) {
      console.error('Auth error:', err.message);
      res.status(401).json({ error: 'Token expired or invalid' });
    }
  };
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { auth, isAdmin };