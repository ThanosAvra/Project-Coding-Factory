// seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Apartment = require('./models/Apartment');
const Booking = require('./models/Booking');
const User = require('./models/user');

dotenv.config();

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne();
    if (!user) {
      console.log('Δεν υπάρχει χρήστης — κάνε πρώτα register στο backend.');
      process.exit();
    }

    const apartments = await Apartment.insertMany([
      { title: 'Seaside Escape', location: 'Χαλκιδική', pricePerNight: 100, owner: user._id },
      { title: 'City Loft', location: 'Θεσσαλονίκη', pricePerNight: 80, owner: user._id }
    ]);

    await Booking.insertMany([
      { apartment: apartments[0]._id, user: user._id, startDate: new Date('2025-09-01'), endDate: new Date('2025-09-07') },
      { apartment: apartments[1]._id, user: user._id, startDate: new Date('2025-10-10'), endDate: new Date('2025-10-15') }
    ]);

    console.log('✅ Dummy apartments & bookings προστέθηκαν!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedData();