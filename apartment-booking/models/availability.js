const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isAvailable: { type: Boolean, default: false }, // false = blocked/unavailable
  reason: { 
    type: String, 
    enum: ['MAINTENANCE', 'PERSONAL_USE', 'RENOVATION', 'BLOCKED', 'OTHER'],
    default: 'BLOCKED'
  },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Index για ταχύτητα αναζήτησης
availabilitySchema.index({ apartment: 1, startDate: 1, endDate: 1 });
availabilitySchema.index({ apartment: 1, isAvailable: 1 });

// Virtual για έλεγχο αν η περίοδος είναι ενεργή
availabilitySchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});

// Static method για έλεγχο διαθεσιμότητας
availabilitySchema.statics.checkAvailability = async function(apartmentId, startDate, endDate) {
  const Booking = require('./booking');
  
  // Check blocked availability periods
  const blockedPeriods = await this.find({
    apartment: apartmentId,
    isAvailable: false,
    $or: [
      { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
      { startDate: { $gte: startDate, $lt: endDate } },
      { endDate: { $gt: startDate, $lte: endDate } }
    ]
  });
  
  // Check existing bookings
  const existingBookings = await Booking.find({
    apartment: apartmentId,
    status: { $in: ['PENDING', 'CONFIRMED', 'PAYMENT_COMPLETED'] },
    $or: [
      { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
      { startDate: { $gte: startDate, $lt: endDate } },
      { endDate: { $gt: startDate, $lte: endDate } }
    ]
  });
  
  return blockedPeriods.length === 0 && existingBookings.length === 0;
};

module.exports = mongoose.model('Availability', availabilitySchema);