const mongoose = require('mongoose');
require('dotenv').config();

// Import models in correct order
const User = require('./models/user');
const Apartment = require('./models/apartment');
const Booking = require('./models/booking');

async function checkBookings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✔ Connected to MongoDB');
    
    const bookings = await Booking.find({})
      .populate('apartment', 'title')
      .populate('user', 'name email');
    
    console.log(`\n📋 Total bookings in database: ${bookings.length}`);
    
    if (bookings.length > 0) {
      console.log('\n=== BOOKINGS LIST ===');
      bookings.forEach((booking, index) => {
        console.log(`${index + 1}. ID: ${booking._id}`);
        console.log(`   User: ${booking.user?.name || 'Unknown'} (${booking.user?.email || 'No email'})`);
        console.log(`   Apartment: ${booking.apartment?.title || 'Unknown'}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Dates: ${booking.startDate} - ${booking.endDate}`);
        console.log(`   Created: ${booking.createdAt}`);
        console.log('   ---');
      });
    } else {
      console.log('\n❌ No bookings found in database');
      console.log('This explains why admin sees 0 bookings');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✔ Disconnected from MongoDB');
  }
}

checkBookings();
