// utils/generateToken.js
const jwt = require('jsonwebtoken');

function generateToken(userPayload) {
  // userPayload could include user id, email, roles, etc.
  return jwt.sign(
    { id: userPayload.id, email: userPayload.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

module.exports = generateToken;