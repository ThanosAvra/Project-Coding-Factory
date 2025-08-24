const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN','USER'], default: 'USER' }
}, { timestamps: true });

// Δεν χρειάζεται pre-save hook γιατί κάνουμε hash στο controller

// μέθοδος ελέγχου κωδικού
userSchema.methods.validPassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);