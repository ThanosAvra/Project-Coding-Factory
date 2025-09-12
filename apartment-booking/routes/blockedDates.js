const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const BlockedDate = require('../models/blockedDate');

// Λήψη όλων των αποκλεισμένων ημερομηνιών (μόνο admin)
router.get('/', auth(['ADMIN']), async (req, res) => {
  try {
    const blockedDates = await BlockedDate.find()
      .populate('apartment', 'title location')
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });
    
    res.json(blockedDates);
  } catch (err) {
    console.error('Σφάλμα κατά τη λήψη αποκλεισμένων ημερομηνιών:', err);
    res.status(500).json({ error: 'Αποτυχία λήψης αποκλεισμένων ημερομηνιών' });
  }
});

// Δημιουργία νέου αποκλεισμού ημερομηνιών (μόνο admin)
router.post('/', auth(['ADMIN']), async (req, res) => {
  try {
    const { startDate, endDate, reason, apartmentId } = req.body;
    
    // Έλεγχος υποχρεωτικών πεδίων
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ 
        error: 'Τα πεδία startDate, endDate και reason είναι υποχρεωτικά' 
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Έλεγχος εγκυρότητας ημερομηνιών
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Μη έγκυρη μορφή ημερομηνίας' });
    }
    
    if (start >= end) {
      return res.status(400).json({ 
        error: 'Η ημερομηνία λήξης πρέπει να είναι μετά την ημερομηνία έναρξης' 
      });
    }
    
    // Έλεγχος για επικαλυπτόμενους αποκλεισμούς
    const overlappingBlock = await BlockedDate.findOne({
      apartment: apartmentId || null,
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } }
      ]
    });
    
    if (overlappingBlock) {
      return res.status(400).json({ 
        error: 'Υπάρχει ήδη αποκλεισμός για αυτές τις ημερομηνίες' 
      });
    }
    
    const blockedDate = new BlockedDate({
      startDate: start,
      endDate: end,
      reason,
      apartment: apartmentId || null,
      createdBy: req.user.id
    });

    await blockedDate.save();
    
    // Populate για την απάντηση
    await blockedDate.populate('apartment', 'title location');
    await blockedDate.populate('createdBy', 'name email');
    
    res.status(201).json(blockedDate);
  } catch (err) {
    console.error('Σφάλμα κατά τη δημιουργία αποκλεισμού:', err);
    res.status(400).json({ error: err.message || 'Αποτυχία δημιουργίας αποκλεισμού' });
  }
});

// Διαγραφή αποκλεισμού ημερομηνιών (μόνο admin)
router.delete('/:id', auth(['ADMIN']), async (req, res) => {
  try {
    const blockedDate = await BlockedDate.findByIdAndDelete(req.params.id);
    
    if (!blockedDate) {
      return res.status(404).json({ error: 'Ο αποκλεισμός δεν βρέθηκε' });
    }
    
    res.json({ message: 'Ο αποκλεισμός αφαιρέθηκε επιτυχώς' });
  } catch (err) {
    console.error('Σφάλμα κατά τη διαγραφή αποκλεισμού:', err);
    res.status(500).json({ error: 'Αποτυχία διαγραφής αποκλεισμού' });
  }
});

// Έλεγχος αν μια ημερομηνία είναι αποκλεισμένη (για χρήση από άλλα endpoints)
router.get('/check/:apartmentId', async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Απαιτούνται startDate και endDate' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const blockedDate = await BlockedDate.findOne({
      $or: [
        { apartment: apartmentId },
        { apartment: null } // Global blocks
      ],
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } }
      ]
    });
    
    res.json({ 
      isBlocked: !!blockedDate,
      blockedDate: blockedDate || null
    });
  } catch (err) {
    console.error('Σφάλμα κατά τον έλεγχο αποκλεισμού:', err);
    res.status(500).json({ error: 'Αποτυχία ελέγχου αποκλεισμού' });
  }
});

module.exports = router;
