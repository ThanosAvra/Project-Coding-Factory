const express = require('express');
const router = express.Router();
const Availability = require('../models/availability');
const Apartment = require('../models/apartment');
const { auth } = require('../middleware/auth');

// 📄 Get availability periods for an apartment
router.get('/apartment/:apartmentId', async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const { startDate, endDate } = req.query;

    let query = { apartment: apartmentId };
    
    // Filter by date range if provided
    if (startDate && endDate) {
      query.$or = [
        { startDate: { $lt: new Date(endDate) }, endDate: { $gt: new Date(startDate) } }
      ];
    }

    const availability = await Availability.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });

    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📄 Check if dates are available for booking
router.get('/check/:apartmentId', async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const isAvailable = await Availability.checkAvailability(
      apartmentId, 
      new Date(startDate), 
      new Date(endDate)
    );

    res.json({ 
      available: isAvailable,
      apartmentId,
      startDate,
      endDate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Block dates (make unavailable)
router.post('/block', auth(), async (req, res) => {
  try {
    const { 
      apartmentId, 
      startDate, 
      endDate, 
      reason = 'BLOCKED', 
      notes 
    } = req.body;

    // Validate apartment exists
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    // Check if user is apartment owner or admin
    const isOwner = apartment.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to block dates for this apartment' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Check for overlapping availability periods
    const overlapping = await Availability.findOne({
      apartment: apartmentId,
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ 
        error: 'Dates overlap with existing availability period',
        conflictingPeriod: overlapping._id
      });
    }

    // Create availability block
    const availability = await Availability.create({
      apartment: apartmentId,
      startDate: start,
      endDate: end,
      isAvailable: false,
      reason,
      notes,
      createdBy: req.user.id
    });

    const populated = await Availability.findById(availability._id)
      .populate('apartment', 'title')
      .populate('createdBy', 'name email');

    res.status(201).json({
      ...populated.toObject(),
      message: 'Dates blocked successfully'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Unblock dates (make available again)
router.delete('/:id', auth(), async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id)
      .populate('apartment');
    
    if (!availability) {
      return res.status(404).json({ error: 'Availability period not found' });
    }

    // Check if user is apartment owner or admin
    const isOwner = availability.apartment.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const isCreator = availability.createdBy.toString() === req.user.id;
    
    if (!isOwner && !isAdmin && !isCreator) {
      return res.status(403).json({ error: 'Not authorized to unblock these dates' });
    }

    await availability.deleteOne();
    res.json({ message: 'Dates unblocked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📝 Update availability period
router.put('/:id', auth(), async (req, res) => {
  try {
    const { startDate, endDate, reason, notes } = req.body;
    
    const availability = await Availability.findById(req.params.id)
      .populate('apartment');
    
    if (!availability) {
      return res.status(404).json({ error: 'Availability period not found' });
    }

    // Check permissions
    const isOwner = availability.apartment.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const isCreator = availability.createdBy.toString() === req.user.id;
    
    if (!isOwner && !isAdmin && !isCreator) {
      return res.status(403).json({ error: 'Not authorized to update this availability period' });
    }

    // Update fields
    if (startDate) availability.startDate = new Date(startDate);
    if (endDate) availability.endDate = new Date(endDate);
    if (reason) availability.reason = reason;
    if (notes !== undefined) availability.notes = notes;

    // Validate dates
    if (availability.startDate >= availability.endDate) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    await availability.save();

    const populated = await Availability.findById(availability._id)
      .populate('apartment', 'title')
      .populate('createdBy', 'name email');

    res.json({
      ...populated.toObject(),
      message: 'Availability period updated successfully'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📊 Get all blocked periods (admin only)
router.get('/admin/all', auth(), async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const availability = await Availability.find({ isAvailable: false })
      .populate('apartment', 'title location')
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });

    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📅 Get blocked periods for specific apartment
router.get('/apartment/:apartmentId', async (req, res) => {
  try {
    const { apartmentId } = req.params;

    const availability = await Availability.find({ 
      apartment: apartmentId,
      isAvailable: false 
    }).sort({ startDate: 1 });

    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
