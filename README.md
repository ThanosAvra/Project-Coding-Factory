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

### Core Functionality
- Browse apartment listings
- View detailed apartment information
- Make bookings with date selection
- Real-time price calculation
- Manage personal bookings
- Cancel reservations
- Owner-based apartment management

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
│   └── .env.template      # Environment variables template
│
└── apartment-client/          # Frontend (React)
    ├── src/
    │   ├── pages/            # React components/pages
    │   │   ├── Home.jsx     # Apartment listings
    │   │   ├── Login.jsx    # User authentication
    │   │   ├── Register.jsx # User registration
    │   │   └── axios.js     # Axios instance with interceptors
    │   ├── App.jsx          # Main React component
    │   └── main.jsx         # 🏠 Apartment Booking System
    ├── package.json         # Frontend dependencies
    └── vite.config.js       # Build tool configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd apartment-booking
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   - Copy `.env.template` to `.env`
   - Fill in your MongoDB connection string and JWT secret:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/apartment-booking
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
   PORT=8080
   ```

4. **Start the backend server:**
   ```bash
   npm start
   # or for development with nodemon:
   npm run dev
   ```

   The backend will run on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd apartment-client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## 🔧 Build & Deployment

### Backend Deployment
```bash
cd apartment-booking
npm install --production
node app.js
```

### Frontend Build
```bash
cd apartment-client
npm run build
# Built files will be in the 'dist' directory
```

### Environment Variables for Production
Ensure the following environment variables are set:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens (minimum 32 characters)
- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Set to 'production' for production builds

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Apartments
- `GET /api/apartments` - List all apartments
- `GET /api/apartments/:id` - Get specific apartment
- `POST /api/apartments` - Create new apartment (authenticated)
- `PUT /api/apartments/:id` - Update apartment (owner only)
- `DELETE /api/apartments/:id` - Delete apartment (owner only)

### Bookings
- `GET /api/bookings` - Get user's bookings (authenticated)
- `POST /api/bookings` - Create new booking (authenticated)
- `DELETE /api/bookings/:id` - Cancel booking (authenticated)

### Users
- `POST /api/users` - Create user (alternative registration)

## 🧪 Testing

### Manual Testing
1. Register a new user account
2. Login with credentials
3. Browse available apartments
4. Make a booking with date selection
5. View bookings in "My Bookings" page
6. Cancel a booking

### API Testing with Postman
Import the API endpoints and test:
- Authentication flow
- CRUD operations for apartments
- Booking creation and management
- Error handling and validation

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes with middleware
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🎨 UI/UX Features

- Modern gradient designs
- Responsive layout for all devices
- Loading states and error feedback
- Form validation with user-friendly messages
- Interactive hover effects
- Greek language localization

## 📚 Technologies Used

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Frontend
- **React**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **CSS-in-JS**: Styling approach

## 🚀 Future Enhancements

- Image upload for apartments
- Advanced search and filtering
- Payment integration
- Email notifications
- Admin dashboard
- Review and rating system
- Calendar availability view
- Multi-language support

## 👨‍💻 Developer

**Thanos Avramidis**  
Coding Factory Final Project - 2025

## 📄 License

This project is developed as part of the Coding Factory program and is intended for educational purposes.

---

**Submission Date**: September 5, 2025  
**GitHub Repository**: [Link to be added]  
**Live Demo**: [Link to be added if deployed]
