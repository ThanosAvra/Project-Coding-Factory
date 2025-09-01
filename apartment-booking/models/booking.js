const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED'], 
    default: 'PENDING' 
  },
  paymentMethod: { type: String, enum: ['credit_card', 'stripe', 'bank_transfer', 'cash'], default: 'credit_card' },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'], 
    default: 'PENDING' 
  },
  paymentId: { type: String },
  paymentDate: { type: Date },
  confirmedAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  notes: { type: String }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ apartment: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if booking is active
bookingSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now && this.status === 'CONFIRMED';
});

// Virtual for checking if booking is upcoming
bookingSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return this.startDate > now && this.status === 'CONFIRMED';
});

// Avoid re-compilation error
module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);