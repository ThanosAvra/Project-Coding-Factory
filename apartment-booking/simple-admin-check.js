// Simple script to check admin users without .env dependency
const mongoose = require('mongoose');

// User schema (inline to avoid dependency issues)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  passwordHash: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkAdmins() {
  try {
    // Try common MongoDB connection strings
    const connectionStrings = [
      'mongodb://localhost:27017/apartment-booking',
      'mongodb://127.0.0.1:27017/apartment-booking',
      'mongodb://localhost:27017/apartmentbooking'
    ];
    
    let connected = false;
    for (const uri of connectionStrings) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        console.log(`✅ Connected to: ${uri}\n`);
        connected = true;
        break;
      } catch (err) {
        console.log(`❌ Failed to connect to: ${uri}`);
      }
    }
    
    if (!connected) {
      console.log('\n💡 MongoDB is not running or not accessible');
      console.log('Please start MongoDB service or check connection');
      return;
    }
    
    // Find admin users
    const admins = await User.find({ role: 'ADMIN' }).select('name email role createdAt');
    
    console.log('👑 ADMIN USERS:');
    console.log('='.repeat(40));
    
    if (admins.length === 0) {
      console.log('❌ No admin users found');
    } else {
      admins.forEach((admin, i) => {
        console.log(`\n${i + 1}. 👤 ${admin.name}`);
        console.log(`   📧 ${admin.email}`);
        console.log(`   📅 ${admin.createdAt?.toLocaleDateString() || 'Unknown date'}`);
      });
    }
    
    console.log(`\n📊 Total admins: ${admins.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

checkAdmins();
