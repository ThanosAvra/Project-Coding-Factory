// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Έλεγχος αν λείπουν πεδία
    if (!username || !password) {
      return res.status(400).json({ error: 'Όνομα χρήστη και κωδικός είναι υποχρεωτικά' });
    }

    // Έλεγχος αν υπάρχει ήδη ο χρήστης
    const existingUser = await User.findOne({ email: username });
    if (existingUser) {
      return res.status(409).json({ error: 'Το όνομα χρήστη υπάρχει ήδη' });
    }

    // Κρυπτογράφηση κωδικού
    const hashedPassword = await bcrypt.hash(password, 10);

    // Δημιουργία νέου χρήστη
    const newUser = new User({ name: username, email: username, passwordHash: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Εγγραφή επιτυχής' });
  } catch (err) {
    console.error('Σφάλμα στην εγγραφή:', err);
    res.status(500).json({ error: 'Κάτι πήγε στραβά στον server' });
  }
});

module.exports = router;