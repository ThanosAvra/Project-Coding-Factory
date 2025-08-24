require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

async function clearUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users with corrupted passwords`);
    
    console.log('✅ Database cleared. You can now register new users.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

clearUsers();
