#  Apartment Booking System - Deployment Guide

## Quick Start (Development)

### 1. Backend Setup
```bash
cd apartment-booking
npm install
# Create .env file with:
# MONGO_URI=mongodb+srv://cfUser:System125%40@cluster0.gzdmr.mongodb.net/apartment-booking?retryWrites=true&w=majority
# JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
# PORT=8080
npm start
```

### 2. Frontend Setup
```bash
cd apartment-client
npm install
npm run dev
```

### 3. Access URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api-docs
- **Database Viewer**: http://localhost:8080/api/db-viewer

### 4. Admin Access
- **Email**: admin@test.com
- **Password**: admin123
- **Dashboard**: http://localhost:5173/admin

##  Key Features Tested & Working

### ✅ Authentication System
- User registration/login
- JWT token management
- Role-based access (USER/ADMIN)
- Protected routes

### ✅ Apartment Management
- CRUD operations for apartments
- Owner-based permissions
- Image upload and display
- Search and filtering

### ✅ Booking System
- Date-based booking creation
- Conflict detection and prevention
- Payment integration (mock)
- Booking status management

### ✅ Availability Management
- Block/unblock apartment dates
- Maintenance periods
- Personal use blocking
- Conflict prevention with bookings

### ✅ Admin Dashboard
- User management
- Booking oversight
- System statistics
- Database viewer

##  Testing Commands

Run these to verify system functionality:

```bash
# Test database connection and admin user
node direct-admin.js

# Test booking system with conflicts
node test-booking-flow.js

# Test admin features
node test-admin-features.js

# Final system validation
node final-test.js
```


- ✅ **Domain Model**: User, Apartment, Booking, Availability entities
- ✅ **Database**: MongoDB Atlas with proper schemas
- ✅ **Backend**: Node.js + Express with REST API
- ✅ **Frontend**: React with routing and authentication
- ✅ **Authentication/Authorization**: JWT with role-based access
- ✅ **CRUD Operations**: Complete for all entities
- ✅ **API Documentation**: Swagger at /api-docs
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Security**: Password hashing, JWT tokens, input validation

