# StayEase - Hotel Booking Platform

StayEase is a full-stack hotel/property booking platform with separate user and admin flows.

## Features

- User registration and login
- Property listing and property details
- Booking flow with date selection
- Wishlist support
- Reviews and ratings
- Admin dashboard for property management
- Separate admin authentication route (`/admin-login`)
- Toast notifications and responsive UI

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

### Frontend
- React (Vite)
- React Router
- Axios
- CSS (custom styling)

## Project Structure

- `config/` - DB configuration
- `middleware/` - auth middleware
- `models/` - Mongoose models
- `routes/` - API routes
- `scripts/` - seed scripts
- `stayease-frontend/` - React frontend

## Environment Variables

### Backend (`.env` in project root)

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
