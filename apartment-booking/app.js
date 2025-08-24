require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS για το frontend σου
app.use(cors({
  origin: 'http://localhost:5173', // ή το domain σου σε production
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('✖ MONGO_URI is not defined in .env');
  process.exit(1);
}

mongoose.set('strictQuery', true);

async function start() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✔ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('✖ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/apartments', require('./routes/apartments'));

// Health check
app.get('/health', (req, res) => {
  const state = ['disconnected','connected','connecting','disconnecting'][mongoose.connection.readyState] || 'unknown';
  res.json({ dbState: state });
});

start();