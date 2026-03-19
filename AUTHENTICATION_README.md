# Authentication System Implementation

## Overview
This document describes the complete authentication system implemented for the Fancy Perfume website, including both frontend and backend components.

## Backend Implementation

### 1. User Model (`back/models/User.js`)
- Complete Mongoose schema with password hashing using bcryptjs
- Fields: name, email, phone, city, password, role
- Automatic password hashing before saving
- Password comparison method for login verification

### 2. Authentication Routes (`back/routes/auth.js`)
- **POST /api/auth/register** - User registration
- **POST /api/auth/login** - User login
- **GET /api/auth/profile** - Get user profile (protected)

### 3. Authentication Middleware (`back/middleware/auth.js`)
- JWT token verification
- User authentication middleware
- Admin role verification middleware

## Frontend Implementation

### 1. Authentication Context (`front/src/contexts/AuthContext.jsx`)
- Centralized authentication state management
- Login, register, and logout functions
- Automatic token verification on app start
- Axios configuration for authenticated requests

### 2. Authentication Components
- **Login.jsx** - User login form with AuthContext integration
- **Register.jsx** - User registration form with AuthContext integration
- **ProtectedRoute.jsx** - Route protection for admin areas

### 3. Updated Components
- **Header.jsx** - Shows login/logout based on authentication state
- **App.jsx** - Wrapped with AuthProvider and protected admin routes

## Features

### User Registration
- Name, email/phone, city, and password fields
- Automatic email/phone detection
- Password hashing and secure storage
- JWT token generation upon successful registration

### User Login
- Login with email or phone number
- Password verification
- JWT token generation and storage
- Role-based redirection (admin vs regular user)

### Authentication State Management
- Persistent login state across browser sessions
- Automatic token verification
- Secure logout with token cleanup
- Real-time authentication status updates

### Route Protection
- Admin routes protected with authentication and role verification
- Automatic redirection to login page for unauthenticated users
- Access denied for non-admin users trying to access admin areas

## Security Features

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - Minimum password length validation
   - Secure password comparison

2. **JWT Tokens**
   - 7-day expiration
   - Secure secret key configuration
   - Automatic token verification

3. **Input Validation**
   - Required field validation
   - Email format validation
   - Duplicate user prevention

## Usage

### Starting the Application
1. Backend: `cd back && npm start`
2. Frontend: `cd front && npm run dev`

### Testing Authentication
1. Navigate to `/Register` to create a new account
2. Navigate to `/Login` to sign in
3. Admin users will be redirected to `/admin` after login
4. Regular users will be redirected to home page

### Admin Access
- Only users with `role: 'admin'` can access admin routes
- Admin panel accessible at `/admin`
- Protected routes automatically redirect unauthorized users

## Environment Variables
Make sure to set the following environment variables:
- `JWT_SECRET` - Secret key for JWT token signing
- `MONGO_URL` - MongoDB connection string

## Dependencies Added
- Backend: `bcryptjs` (already present)
- Frontend: No new dependencies required (using existing axios and react-router-dom)
