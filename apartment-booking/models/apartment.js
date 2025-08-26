const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  description: { type: String }
}, { timestamps: true });

// Avoid re-compilation error
module.exports = mongoose.models.Apartment || mongoose.model('Apartment', apartmentSchema);