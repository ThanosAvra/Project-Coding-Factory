require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { swaggerUi, specs } = require('./swagger');

const app = express();

// Import routes at the top level to avoid re-compilation issues
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const apartmentRoutes = require('./routes/apartments');
const bookingRoutes = require('./routes/bookings');
const availabilityRoutes = require('./routes/availability');
const adminRoutes = require('./routes/admin');
const blockedDatesRoutes = require('./routes/blockedDates');
console.log('✅ BlockedDates routes loaded successfully');

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
    app.use('/api/availability', availabilityRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/blocked-dates', blockedDatesRoutes);
    console.log('✅ BlockedDates routes registered at /api/blocked-dates');

    app.get('/health', (req, res) => {
      const state = ['disconnected','connected','connecting','disconnecting'][mongoose.connection.readyState] || 'unknown';
      res.json({ dbState: state });
    });

    // Database viewer endpoint
    app.get('/api/db-viewer', async (req, res) => {
      try {
        const User = require('./models/user');
        const Apartment = require('./models/apartment');
        const Booking = require('./models/booking');
        const Availability = require('./models/availability');

        const users = await User.find({}).select('-passwordHash');
        const apartments = await Apartment.find({}).populate('owner', 'name email');
        const bookings = await Booking.find({})
          .populate('user', 'name email')
          .populate('apartment', 'title location');
        const availability = await Availability.find({}).populate('apartment', 'title');

        const collections = await mongoose.connection.db.listCollections().toArray();
        
        res.json({
          database: mongoose.connection.name,
          connectionString: 'MongoDB Atlas Connected',
          collections: collections.map(c => c.name),
          statistics: {
            users: users.length,
            apartments: apartments.length,
            bookings: bookings.length,
            availability: availability.length
          },
          data: {
            users: users.map(user => ({
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              createdAt: user.createdAt
            })),
            apartments: apartments.map(apt => ({
              id: apt._id,
              title: apt.title,
              location: apt.location,
              price: apt.price,
              beds: apt.characteristics.beds,
              bathrooms: apt.characteristics.bathrooms,
              maxGuests: apt.characteristics.maxGuests,
              owner: apt.owner ? apt.owner.name : 'Unknown',
              isAvailable: apt.isAvailable,
              images: apt.images ? apt.images.length : 0
            })),
            bookings: bookings.map(booking => ({
              id: booking._id,
              user: booking.user ? booking.user.name : 'Unknown',
              apartment: booking.apartment ? booking.apartment.title : 'Unknown',
              checkIn: booking.checkInDate,
              checkOut: booking.checkOutDate,
              guests: booking.guests,
              totalPrice: booking.totalPrice,
              status: booking.status,
              createdAt: booking.createdAt
            })),
            availability: availability.map(avail => ({
              id: avail._id,
              apartment: avail.apartment ? avail.apartment.title : 'Unknown',
              date: avail.date,
              isAvailable: avail.isAvailable,
              price: avail.price
            }))
          }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Create admin endpoint
    app.post('/api/create-admin', async (req, res) => {
      try {
        const User = require('./models/user');
        const bcrypt = require('bcryptjs');
        
        // Check if admin exists
        const existingAdmin = await User.findOne({ role: 'ADMIN' });
        if (existingAdmin) {
          return res.json({ 
            message: 'Admin already exists',
            admin: {
              email: existingAdmin.email,
              name: existingAdmin.name
            }
          });
        }

        // Create admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
          name: 'Administrator',
          email: 'admin@test.com',
          passwordHash: hashedPassword,
          role: 'ADMIN'
        });

        await admin.save();
        
        res.json({ 
          message: 'Admin created successfully',
          credentials: {
            email: 'admin@test.com',
            password: 'admin123'
          }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
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