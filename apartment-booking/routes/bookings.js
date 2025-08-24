const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Apartment = require('../models/Apartment');
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

// ➕ Δημιουργία κράτησης
router.post('/', auth(), async (req, res) => {
  try {
    const { apartmentId, startDate, endDate, totalPrice } = req.body;
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) return res.status(404).json({ error: 'Apartment not found' });

    // Έλεγχος: δεν μπορείς να κλείσεις το δικό σου διαμέρισμα
    if (apartment.owner.toString() === req.user.id) {
      return res.status(403).json({ error: 'Cannot book your own apartment' });
    }

    const booking = await Booking.create({
      user: req.user.id,
      apartment: apartment._id,
      startDate,
      endDate,
      totalPrice: totalPrice || 0
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

module.exports = router;