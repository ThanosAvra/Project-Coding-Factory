const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
  date: { type: Date, required: true },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

// index για ταχύτητα αναζήτησης
availabilitySchema.index({ apartment: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);