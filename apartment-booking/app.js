require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { swaggerUi, specs } = require('./swagger');

// Import routes at the top level to avoid re-compilation issues
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const apartmentRoutes = require('./routes/apartments');
const bookingRoutes = require('./routes/bookings');

const app = express();

// CORS για το frontend σου
app.use(cors({
  origin: 'http://localhost:5173', // ή το domain σου σε production
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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


    // Swagger API Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Apartment Booking API Documentation'
    }));

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/apartments', apartmentRoutes);
    app.use('/api/bookings', bookingRoutes);

    app.get('/health', (req, res) => {
      const state = ['disconnected','connected','connecting','disconnecting'][mongoose.connection.readyState] || 'unknown';
      res.json({ dbState: state });
    });

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('✖ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

start();