# Apartment Booking System - Coding Factory Final Project

## 📋 Project Overview

A full-stack apartment booking application built with Node.js, Express, MongoDB, and React. This system allows users to register, browse apartments, make bookings, and manage their reservations with a complete authentication and authorization system.

## 🏗️ Architecture & Domain Model

### Domain Entities
- **User**: Authentication and user management
- **Apartment**: Property listings with owner relationships
- **Booking**: Reservation system linking users and apartments

### Technology Stack
- **Backend**: Node.js + Express.js + MongoDB + Mongoose
- **Frontend**: React + Vite + Axios
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: CSS-in-JS with modern UI components

## 🚀 Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Protected routes and middleware
- Role-based access control (USER/ADMIN)
- Admin dashboard with user management

### Core Functionality
- Browse apartment listings
- View detailed apartment information
- Make bookings with date selection
- Real-time price calculation
- Manage personal bookings
- Cancel reservations
- Owner-based apartment management
- **Availability Management System** - Block dates for maintenance, personal use, etc.
- Booking conflict detection and prevention
- Payment integration (mock payment system)

### UI/UX Features
- Responsive design
- Modern gradient styling
- Loading states and error handling
- Greek language support
- Interactive hover effects

## 📁 Project Structure

```
Project Coding Factory/
├── apartment-booking/          # Backend (Node.js/Express)
│   ├── controllers/           # Business logic controllers
│   │   └── authController.js  # Authentication logic
│   ├── models/               # MongoDB schemas
│   │   ├── user.js          # User model
│   │   ├── apartment.js     # Apartment model
│   │   └── booking.js       # Booking model
│   ├── routes/              # API endpoints
│   │   ├── auth.js         # Authentication routes
│   │   ├── apartments.js   # Apartment CRUD operations
│   │   ├── bookings.js     # Booking management
│   │   └── users.js        # User management
│   ├── middleware/          # Custom middleware
│   │   └── auth.js         # JWT authentication middleware
│   ├── config/             # Configuration files
│   │   └── db.js          # Database connection
│   ├── utils/              # Utility functions
│   │   └── generateToken.js # JWT token generation
│   ├── app.js             # Main application file
│   ├── package.json       # Dependencies and scripts
│   └── .env.template      # 🏢 Apartment Booking System

A modern, full-stack apartment booking application built with Node.js, Express, MongoDB, and React. This system allows users to browse apartments, make bookings, and manage their reservations, while providing administrators with comprehensive management tools.

## 🌟 Key Features

### User Features
- **Browse Apartments**: View available apartments with photos, amenities, and detailed information
- **Smart Booking**: Real-time availability checking with visual calendar blocking
- **User Authentication**: Secure registration and login system with JWT tokens
- **Booking Management**: Create, view, and manage personal reservations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Admin Features
- **User Management**: View and manage all registered users
- **Apartment Management**: Full CRUD operations for apartment listings
- **Booking Oversight**: Monitor all bookings and their statuses
- **Availability Control**: Block/unblock dates for maintenance or personal use
- **Admin Dashboard**: Comprehensive system overview and statistics

### Technical Features
- **RESTful API**: Well-structured API with comprehensive endpoints
- **Real-time Availability**: Advanced date conflict detection and resolution
- **Image Upload**: Multiple photo support with automatic compression
- **Role-based Access**: Secure permissions for users and administrators
- **API Documentation**: Complete Swagger/OpenAPI documentation

## 🛠️ Technology Stack

### Backend
- **Node.js & Express.js** - Server runtime and web framework
- **MongoDB & Mongoose** - Database and object modeling
- **JWT & bcryptjs** - Authentication and password security
- **Swagger** - API documentation

### Frontend
- **React 18 & Vite** - Modern UI library and build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **React DatePicker** - Advanced date selection with exclusions
- **Modern CSS** - Responsive design with CSS Grid and Flexbox

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local MongoDB
- Git

### Installation

1. **Clone and setup backend:**
```bash
git clone <repository-url>
cd apartment-booking
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm start
```

2. **Setup frontend (new terminal):**
```bash
cd apartment-client
npm install
npm run dev
```

3. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- API Documentation: http://localhost:8080/api-docs

## 📋 Environment Configuration

Create `.env` file in the `apartment-booking` directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
PORT=8080
```

## 👤 Admin Access

Create an admin account for testing:
```bash
cd apartment-booking
node create-admin.js
```

Default admin credentials (if available):
- Email: admin@example.com
- Password: admin123

## 📚 API Documentation

Complete API documentation is available at `/api-docs` when the server is running.

### Core Endpoints
- **Authentication**: `/api/users/*` - Registration, login, profile
- **Apartments**: `/api/apartments/*` - CRUD operations for listings
- **Bookings**: `/api/bookings/*` - Reservation management
- **Availability**: `/api/availability/*` - Date blocking and checking

## 🏗️ Project Architecture

```
Project Coding Factory/
├── apartment-booking/          # Backend (Node.js + Express + MongoDB)
│   ├── config/                 # Database and service configurations
│   ├── controllers/            # Business logic
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API endpoints
│   └── app.js                  # Main server file
├── apartment-client/           # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── context/            # React context providers
│   │   └── api/                # API configuration
└── README.md                   # This documentation
```

## 🧪 Testing

### Backend Testing
```bash
cd apartment-booking
npm test
```

### API Testing
Import the Postman collection: `Apartment-Booking-API.postman_collection.json`

## 🚀 Deployment

### Backend
1. Deploy to Heroku, Railway, or similar platform
2. Set environment variables in hosting platform
3. Connect to MongoDB Atlas

### Frontend
1. Build production version: `npm run build`
2. Deploy to Netlify, Vercel, or GitHub Pages
3. Update API base URL in production

## 🎯 Key Implementation Highlights

- **Smart Date Blocking**: Visual calendar exclusions for booked/blocked dates
- **Conflict Detection**: Prevents double bookings with real-time validation
- **Image Handling**: Base64 encoding with automatic compression
- **Security**: JWT authentication with role-based access control
- **User Experience**: Toast notifications and loading states
- **Responsive Design**: Mobile-first approach with modern CSS

## 📝 Development Notes

This project demonstrates:
- Full-stack JavaScript development
- RESTful API design and implementation
- Modern React patterns and hooks
- Database modeling and relationships
- Authentication and authorization systems
- File upload and image handling
- Real-time data validation
- Responsive web design principles

## 🆘 Troubleshooting

Common issues and solutions:
1. **MongoDB Connection**: Verify MONGO_URI in .env file
2. **JWT Errors**: Ensure JWT_SECRET is set and consistent
3. **CORS Issues**: Check API base URL in frontend configuration
4. **Port Conflicts**: Modify PORT in .env if 8080 is occupied

---

**Built for the Coding Factory Program - Final Project Submission**

*This application showcases modern web development practices and full-stack JavaScript expertise.*

## 📄 License

This project is developed as part of the Coding Factory program and is intended for educational purposes.

---

**Submission Date**: September 5, 2025  
**GitHub Repository**: [Link to be added]  
**Live Demo**: [Link to be added if deployed]
