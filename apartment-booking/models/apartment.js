const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  description: { type: String },
  images: [{ type: String }], // Array of image URLs/paths
  beds: { type: Number, default: 1 },
  bathrooms: { type: Number, default: 1 },
  maxGuests: { type: Number, default: 2 },
  amenities: [{ type: String }],
  available: { type: Boolean, default: true }
}, { timestamps: true });

// Avoid re-compilation error
module.exports = mongoose.models.Apartment || mongoose.model('Apartment', apartmentSchema);