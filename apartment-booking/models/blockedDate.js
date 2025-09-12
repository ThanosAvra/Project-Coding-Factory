const mongoose = require('mongoose');

const blockedDateSchema = new mongoose.Schema({
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  reason: { 
    type: String, 
    required: true,
    default: 'Συντήρηση'
  },
  apartment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Apartment',
    default: null // null = global block για όλα τα διαμερίσματα
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Validation: endDate πρέπει να είναι μετά από startDate
blockedDateSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('Η ημερομηνία λήξης πρέπει να είναι μετά την ημερομηνία έναρξης'));
  }
  next();
});

module.exports = mongoose.model('BlockedDate', blockedDateSchema);
