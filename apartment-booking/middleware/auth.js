
const jwt = require('jsonwebtoken');

/**
 * Middleware για έλεγχο JWT και (προαιρετικά) ρόλων.
 * Χρήση:
 *   auth()            -> για όλους τους logged-in
 *   auth(['ADMIN'])   -> μόνο admin
 */
module.exports = (roles = []) => {
  // αν δοθεί string, το κάνουμε array
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not set in environment variables');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, role, iat, exp }

      // Αν έχουν οριστεί ρόλοι, ελέγχουμε πρόσβαση
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    } catch (err) {
      console.error('Auth error:', err.message);
      res.status(403).json({ error: 'Token expired or invalid' });
    }
  };
};