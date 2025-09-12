#  Apartment Booking System - Project Structure

##  Project Overview
This is a full-stack apartment booking application built with Node.js/Express backend and React frontend.

##  Directory Structure

```
Project Coding Factory/
├── apartment-booking/          # Backend (Node.js + Express + MongoDB)
│   ├── config/                 # Database and external service configurations
│   ├── controllers/            # Business logic controllers
│   ├── middleware/             # Authentication and validation middleware
│   ├── models/                 # MongoDB schemas and models
│   ├── routes/                 # API route definitions
│   ├── utils/                  # Utility functions
│   ├── app.js                  # Main server application
│   ├── package.json            # Backend dependencies
│   └── .env                    # Environment variables (not in git)
│
├── apartment-client/           # Frontend (React + Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # API configuration
│   │   ├── components/         # Reusable React components
│   │   ├── context/            # React context providers
│   │   ├── pages/              # Page components
│   │   ├── App.jsx             # Main React application
│   │   └── main.jsx            # React entry point
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
│
├── README.md                   # Main project documentation
├── DEPLOYMENT_GUIDE.md         # Deployment instructions
└── PROJECT_STRUCTURE.md        # This file
```

##  Key Features

### Backend Features
- **Authentication & Authorization**: JWT-based auth with role-based access (USER/ADMIN)
- **Apartment Management**: CRUD operations for apartments with image upload
- **Booking System**: Complete booking workflow with conflict detection
- **Availability Management**: Block/unblock dates for maintenance or personal use
- **Admin Dashboard**: User and booking management for administrators
- **API Documentation**: Swagger/OpenAPI documentation at `/api-docs`

### Frontend Features
- **Modern React UI**: Built with React 18 and Vite
- **Responsive Design**: Mobile-first design with CSS Grid/Flexbox
- **User Authentication**: Login/Register with persistent sessions
- **Apartment Browsing**: Search and filter apartments
- **Booking Flow**: Date selection with availability checking
- **Admin Interface**: Administrative functions for managing users and bookings
- **Toast Notifications**: User-friendly feedback system

##  Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Base64 image encoding
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest framework

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Date Picker**: React DatePicker
- **Styling**: Modern CSS with CSS Variables
- **State Management**: React Context API

## 📋 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user

### Apartments
- `GET /api/apartments` - List all apartments
- `POST /api/apartments` - Create apartment (auth required)
- `GET /api/apartments/:id` - Get apartment details
- `PUT /api/apartments/:id` - Update apartment (owner/admin)
- `DELETE /api/apartments/:id` - Delete apartment (owner/admin)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Availability
- `GET /api/availability/check/:apartmentId` - Check date availability
- `POST /api/availability/block` - Block dates (owner/admin)
- `DELETE /api/availability/unblock/:id` - Unblock dates

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### Backend Setup
```bash
cd apartment-booking
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm start
```

### Frontend Setup
```bash
cd apartment-client
npm install
npm run dev
```

##  Key Implementation Details

### Security
- Passwords hashed with bcrypt
- JWT tokens for stateless authentication
- Role-based access control (USER/ADMIN)
- Input validation and sanitization

### Database Design
- **Users**: Authentication and profile data
- **Apartments**: Property listings with images and amenities
- **Bookings**: Reservation records with status tracking
- **Availability**: Date blocking for maintenance/personal use

### User Experience
- Responsive design for all screen sizes
- Real-time availability checking
- Visual feedback with toast notifications
- Intuitive navigation and form validation

##  Development Notes

This project demonstrates:
- Full-stack JavaScript development
- RESTful API design
- Modern React patterns and hooks
- Database modeling and relationships
- Authentication and authorization
- File upload handling
- Error handling and validation
- Responsive web design
- API documentation with Swagger

Built for the Coding Factory program as a final project submission.
