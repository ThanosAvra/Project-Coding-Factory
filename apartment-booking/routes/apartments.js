const express = require('express');
const router = express.Router();
const Apartment = require('../models/apartment');
const { auth } = require('../middleware/auth');

// Λίστα όλων των διαμερισμάτων (public)
router.get('/', async (req, res) => {
  try {
    const apartments = await Apartment.find().populate('owner', 'name email');
    res.json(apartments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Λήψη συγκεκριμένου διαμερίσματος (public)
router.get('/:id', async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id).populate('owner', 'name email');
    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }
    res.json(apartment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Δημιουργία νέου διαμερίσματος (μόνο για ADMIN ή USER που είναι host)
router.post('/', auth(['ADMIN', 'USER']), async (req, res) => {
  try {
    const { title, location, pricePerNight } = req.body;
    const apartment = await Apartment.create({
      owner: req.user.id,
      title,
      location,
      pricePerNight
    });
    res.status(201).json(apartment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ενημέρωση διαμερίσματος (μόνο ιδιοκτήτης ή ADMIN)
router.put('/:id', auth(['ADMIN', 'USER']), async (req, res) => {
  try {
    const apt = await Apartment.findById(req.params.id);
    if (!apt) return res.status(404).json({ error: 'Not found' });

    if (apt.owner.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not allowed' });
    }

    Object.assign(apt, req.body);
    await apt.save();
    res.json(apt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Διαγραφή διαμερίσματος
router.delete('/:id', auth(['ADMIN', 'USER']), async (req, res) => {
  try {
    const apt = await Apartment.findById(req.params.id);
    if (!apt) return res.status(404).json({ error: 'Not found' });

    if (apt.owner.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not allowed' });
    }

    await apt.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;