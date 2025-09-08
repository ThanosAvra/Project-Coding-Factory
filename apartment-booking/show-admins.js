const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

async function showAdmins() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apartment-booking');
    console.log('🔗 Connected to database\n');
    
    // Find all admin users
    const admins = await User.find({ role: 'ADMIN' }).select('name email role createdAt');
    
    console.log('👑 ADMIN USERS FOUND:');
    console.log('='.repeat(50));
    
    if (admins.length === 0) {
      console.log('❌ No admin users found in the database');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. 👤 Name: ${admin.name}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   🔑 Role: ${admin.role}`);
        console.log(`   📅 Created: ${admin.createdAt.toLocaleString('el-GR')}`);
        console.log(`   🆔 ID: ${admin._id}`);
      });
      
      console.log('\n' + '='.repeat(50));
      console.log(`📊 Total admin users: ${admins.length}`);
    }
    
    // Also show total users
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure MongoDB is running:');
      console.log('   - Start MongoDB service');
      console.log('   - Or check your MONGODB_URI in .env file');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
}

// Run the function
showAdmins();
