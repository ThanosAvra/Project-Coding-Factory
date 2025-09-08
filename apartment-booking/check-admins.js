const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

async function checkAdmins() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apartment-booking');
    console.log('Connected to database');
    
    // Find all admin users
    const admins = await User.find({ role: 'ADMIN' }).select('name email role createdAt');
    
    console.log('\n=== ADMIN USERS ===');
    console.log(`Total admin users found: ${admins.length}\n`);
    
    if (admins.length === 0) {
      console.log('❌ No admin users found in the database');
      console.log('💡 You can create an admin user by registering and then promoting them');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }
    
    // Also check total users
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
}

checkAdmins();
