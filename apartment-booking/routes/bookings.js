const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Apartment = require('../models/apartment');
const auth = require('../middleware/auth');

// 📄 Λίστα όλων των κρατήσεων του τρέχοντος χρήστη
router.get('/', auth(), async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('apartment', 'title location');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📄 Λίστα όλων των κρατήσεων του τρέχοντος χρήστη (alternative endpoint)
router.get('/my', auth(), async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('apartment', 'title location');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Δημιουργία κράτησης
router.post('/', auth(), async (req, res) => {
  try {
    const { 
      apartmentId, 
      startDate, 
      endDate, 
      totalPrice, 
      paymentMethod = 'credit_card',
      paymentStatus = 'PENDING',
      paymentId,
      notes
    } = req.body;
    
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) return res.status(404).json({ error: 'Apartment not found' });

    // Check if dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    if (start >= end) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      apartment: apartmentId,
      status: { $in: ['CONFIRMED', 'PAYMENT_COMPLETED'] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } },
        { startDate: { $gte: start, $lt: end } },
        { endDate: { $gt: start, $lte: end } }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ 
        error: 'This apartment is already booked for the selected dates',
        conflictingBooking: overlappingBooking._id
      });
    }

    // Create booking with payment info
    const bookingData = {
      user: req.user.id,
      apartment: apartment._id,
      startDate: start,
      endDate: end,
      totalPrice: Number(totalPrice) || 0,
      paymentMethod,
      paymentStatus,
      paymentId,
      notes,
      status: paymentStatus === 'COMPLETED' ? 'CONFIRMED' : 'PENDING'
    };

    if (paymentStatus === 'COMPLETED') {
      bookingData.confirmedAt = new Date();
      bookingData.paymentDate = new Date();
    }

    const booking = await Booking.create(bookingData);
    
    // Populate the apartment details in the response
    const populatedBooking = await Booking.findById(booking._id).populate('apartment', 'title location');
    
    res.status(201).json({
      ...populatedBooking.toObject(),
      message: paymentStatus === 'COMPLETED' 
        ? 'Booking confirmed successfully' 
        : 'Booking created successfully. Please complete the payment.'
    });
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(400).json({ 
      error: err.message || 'Error creating booking',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// ➕ Δημιουργία κράτησης για συγκεκριμένο διαμέρισμα (legacy route)
router.post('/:apartmentId', auth(), async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const apartment = await Apartment.findById(req.params.apartmentId);
    if (!apartment) return res.status(404).json({ error: 'Apartment not found' });

    // Έλεγχος: δεν μπορείς να κλείσεις το δικό σου διαμέρισμα
    if (apartment.owner.toString() === req.user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const booking = await Booking.create({
      user: req.user.id,
      apartment: apartment._id,
      startDate,
      endDate
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Διαγραφή κράτησης (μόνο ο χρήστης που την έκανε)
router.delete('/:id', auth(), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    await booking.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Επιβεβαίωση κράτησης
router.put('/:id/confirm', auth(), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Έλεγχος αν ο χρήστης είναι ο ιδιοκτήτης του διαμερίσματος
    const apartment = await Apartment.findById(booking.apartment);
    if (!apartment) return res.status(404).json({ error: 'Apartment not found' });
    
    // Μόνο ο ιδιοκτήτης ή ο διαχειριστής μπορεί να επιβεβαιώσει την κράτηση
    if (apartment.owner.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to confirm this booking' });
    }

    // Ενημέρωση κατάστασης κράτησης
    booking.status = 'CONFIRMED';
    booking.confirmedAt = new Date();
    await booking.save();

    res.json({ message: 'Booking confirmed', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;