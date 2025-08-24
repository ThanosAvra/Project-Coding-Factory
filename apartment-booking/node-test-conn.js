// test-conn.js
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000, family: 4 });
    console.log('Connected OK');
  } catch (e) {
    console.error('Connect failed:', e);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
})();