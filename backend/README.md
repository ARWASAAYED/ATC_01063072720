# Ticketing Platform Backend

## Overview

## Prerequisites
- Node.js (v18.x)
- MongoDB (e.g., mongodb://localhost:27017/your_database)

## Setup
1. cd backend
2. npm install
3. Create .env with:
   ```
   PORT=9881
   MONGODB_URI=mongodb://localhost:27017/your_database
   JWT_SECRET=your_jwt_secret
   ```
4. Start server: npm run start (runs on http://localhost:9881)

## API Endpoints
- POST /api/auth/login
- GET/POST /api/events
- GET/POST /api/speakers
- GET/POST /api/venues
