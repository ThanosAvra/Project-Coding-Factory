const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Apartment = require('../models/apartment');
const { auth } = require('../middleware/auth');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Bookings endpoint is working', timestamp: new Date() });
});

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
    console.log('=== BOOKING CREATION REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user);
    
    const { 
      apartment: apartmentField,
      apartmentId, 
      startDate, 
      endDate, 
      totalPrice, 
      paymentMethod = 'credit_card',
      paymentStatus = 'PENDING',
      paymentId,
      notes,
      status,
      paymentDate
    } = req.body;
    
    // Use apartment field if apartmentId is not provided
    const finalApartmentId = apartmentId || apartmentField;
    console.log('Final apartment ID:', finalApartmentId);
    
    if (!finalApartmentId) {
      return res.status(400).json({ error: 'Apartment ID is required' });
    }
    
    // Validate ObjectId format
    if (!finalApartmentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid apartment ID format', apartmentId: finalApartmentId });
    }
    
    const apartment = await Apartment.findById(finalApartmentId);
    console.log('Found apartment:', apartment ? apartment.title : 'NOT FOUND');
    if (!apartment) {
      return res.status(404).json({ 
        error: 'Apartment not found', 
        apartmentId: finalApartmentId,
        message: 'The specified apartment does not exist in the database'
      });
    }

    // Check if dates are valid
    console.log('Validating dates:', { startDate, endDate });
    const start = new Date(startDate);
    const end = new Date(endDate);
    console.log('Parsed dates:', { start, end });
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.log('Invalid date format detected');
      return res.status(400).json({ error: 'Invalid date format', startDate, endDate });
    }
    if (start >= end) {
      console.log('End date is not after start date');
      return res.status(400).json({ error: 'End date must be after start date', start, end });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      apartment: finalApartmentId,
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
    console.error('Request body:', req.body);
    res.status(400).json({ 
      error: err.message || 'Error creating booking',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      receivedData: req.body
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

    const apartment = await Apartment.findById(booking.apartment);
    if (!apartment) return res.status(404).json({ error: 'Apartment not found' });
    
    // Allow confirmation if:
    // 1. User is the one who made the booking AND is confirming payment
    // 2. User is the apartment owner
    // 3. User is an admin
    const isBookingOwner = booking.user.toString() === req.user.id;
    const isApartmentOwner = apartment.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    
    if (!isBookingOwner && !isApartmentOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to confirm this booking' });
    }

    // If confirming payment, update payment status
    if (req.body.paymentIntentId) {
      booking.paymentIntentId = req.body.paymentIntentId;
      booking.paymentStatus = 'COMPLETED';
      booking.paymentDate = new Date();
    }
    
    // Update booking status
    booking.status = 'CONFIRMED';
    booking.confirmedAt = booking.confirmedAt || new Date();
    await booking.save();

    res.json({ message: 'Booking confirmed', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;