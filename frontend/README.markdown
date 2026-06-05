# EventSchedulerApp

A full-stack event scheduling application with a React frontend and Node.js/Express/MongoDB backend. Users can browse events, view schedules, book tickets, and manage profiles, while administrators can manage events and users.

## Features
- **Conference Schedule**: View a multi-day schedule with session filtering and search (`/schedule`).
- **Event Calendar**: Browse events by date with a monthly calendar (`/calendar`).
- **Event Booking**: Browse events, view details, add to cart, and pay via Stripe (`/events`, `/event/:id`, `/cart`, `/checkout`).
- **Authentication**: User login, signup, and profile management (`/login`, `/signup`, `/profile`).
- **Admin Dashboard**: Manage users, events, and venues (`/admin`, `/admin/users`, `/admin/event-list`, `/admin/venue-list`, `/admin/add-event`, `/admin/add-venue`, `/admin/edit-event/:id`, `/admin/edit-venue/:id`, `/admin/delete-event/:id`, `/admin/delete-venue/:id`, `/admin/add-speaker`, `/admin/delete-speaker/:id`,`/admin/speaker-list`, `admin/bookings`, `admin/dashboard`).
- **Dynamic Ports**: Backend auto-selects ports (9876–9881), frontend auto-detects via `/api/port`.
- **File Uploads**: Upload images for events/speakers (`/api/upload`, max 5MB, JPEG/PNG).
- **Responsive Design**: Built with React Bootstrap and Framer Motion for animations.

## Project Structure
```
EventSchedulerApp/
├── backend/          # Node.js/Express backend
│   ├── config/       # Database configuration
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── Uploads/      # Image storage
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/         # React frontend
│   ├── public/       # Static assets
│   ├── src/          # React components, pages, context, utils
│   ├── package.json
│   ├── .env.example
│   └── vite.config.js
├── README.md
└── .gitignore
```

## Prerequisites
- **Node.js**: v16 or higher
- **MongoDB**: Local or cloud (e.g., MongoDB Atlas)
- **Git**: For cloning and pushing to GitHub
- **npm**: Included with Node.js
- **Stripe Account**: API keys from [Stripe Dashboard](https://dashboard.stripe.com)

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/<your-username>/EventSchedulerApp.git
   cd EventSchedulerApp
   ```

2. **Backend Setup**:
   - Navigate to `backend/`:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Copy `.env.example` to `.env` and configure:
     ```bash
     cp .env.example .env
     ```
     ```env
     PORT=9876
     MONGODB_URI=mongodb://localhost:27017/eventscheduler
     JWT_SECRET=your_jwt_secret_here
     STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
     STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
     FILE_UPLOAD_PATH=Uploads
     MAX_FILE_UPLOAD=5000000
     CLIENT_URL=http://localhost:5174
     NODE_ENV=development
     ```
   - Create `Uploads/` directory:
     ```bash
     mkdir Uploads
     ```
   - Add a sample image (e.g., `event.jpg`) to `Uploads/` for testing.

3. **Frontend Setup**:
   - Navigate to `frontend/`:
     ```bash
     cd ../frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Copy `.env.example` to `.env` and configure:
     ```bash
     cp .env.example .env
     ```
     ```env
     VITE_API_URL=http://localhost:9876/api
     VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
     ```
   - Create `uploads/` for placeholders:
     ```bash
     mkdir -p uploads
     ```

4. **Seed the Database**:
   - Connect to MongoDB:
     ```bash
     mongosh
     ```
   - Insert test data:
     ```javascript
     use eventscheduler
     db.users.insertOne({
       email: "admin@example.com",
       password: "$2a$10$examplehashedpassword",
       role: "admin"
     })
     db.events.insertOne({
       _id: ObjectId("507f1f77bcf86cd799439012"),
       title: "Jazz Festival",
       category: "Music",
       description: "A weekend of jazz performances.",
       startDate: ISODate("2025-05-25T17:00:00Z"),
       tickets: [{ type: "General", price: 75 }],
       image: "event.jpg",
       isFeatured: true
     })
     db.speakers.insertOne({
       _id: ObjectId("507f191e810c19729de860ea"),
       name: "Dr. Sophia Chen",
       position: "AI Research Scientist",
       company: "TechNova Institute",
       profileImage: "/uploads/sophia-chen.jpg",
       expertise: ["AI"]
     })
     ```

5. **Run the Application**:
   - Start the backend:
     ```bash
     cd backend
     npm start
     ```
     - Note the port (e.g., 9876) from the console.
   - Start the frontend:
     ```bash
     cd ../frontend
     npm run dev
     ```
     - Open `http://localhost:5174`.

## Usage

- **Browse Events**:
  - Visit `/` for the homepage.
  - Go to `/events` to browse events like "Jazz Festival".
  - Click an event to view details at `/event/507f1f77bcf86cd799439012`.

- **Event Calendar** (`/calendar`):
  - View events in a monthly calendar (e.g., May 2025).
  - Click May 25 to see "Jazz Festival" details.

- **Conference Schedule** (`/schedule`):
  - View the "Tech Innovators Summit 2025" schedule (June 10–12, 2025).
  - Filter sessions by type (e.g., Keynote) or search for speakers like "Dr. Sophia Chen".

- **User Features**:
  - Register at `/signup` and login at `/login` (e.g., `admin@example.com`).
  - View and update profile at `/profile` show edit profile and password and my tickets and booking history.
  - Add events to cart at `/cart`, then proceed to `/checkout` with Stripe (test card: `4242 4242 4242 4242`, any future expiry, any CVC).
  

- **Admin Features**:
  - Login as an admin (`admin@example.com`).
  - Access `/admin` for the dashboard.
  - Manage users at `/admin/users`, events at `/admin/event-list`, venues at `/admin/venue-list`, or add events at `/admin/add-event`, and venues at `/admin/add-venue`, and add speakers at `/admin/add-speaker`, `/admin/delete-speaker/:id`, and show list of speakers `/admin/speaker-list`, show list of booking  `admin/bookings`, `admin/dashboard`.

## API Endpoints (Backend)

- **Auth**:
  - `POST /api/auth/register`: Register a user.
  - `POST /api/auth/login`: Login and get JWT.
  - `GET /api/auth/me`: Get current user (requires JWT).
- **Events**:
  - `GET /api/events`: List events (supports `isFeatured`, `limit`).
  - `GET /api/events/:id`: Get event details.
  - `POST /api/events`: Create event (admin, requires JWT).
  - `PUT /api/events/:id`: Update event (admin, requires JWT).
  - `DELETE /api/events/:id`: Delete event (admin, requires JWT).
- **Venues**:
- `GET /api/venues`: List venues.
- `GET /api/venues/:id`: Get venue details.
  - `POST /api/venues`: Create venue (admin, requires JWT).
  - `PUT /api/venues/:id`: Update venue (admin, requires JWT).
  - `DELETE /api/venues/:id`: Delete venue (admin, requires JWT).
-  **Speakers**:
-  `GET /api/speakers`: List speakers.
-  `GET /api/speakers/:id`: Get speaker details.
-  `POST /api/speakers`: Create speaker (admin, requires JWT).
-  `PUT /api/speakers/:id`: Update speaker (admin, requires JWT).
-  `DELETE /api/speakers/:id`: Delete speaker (admin, requires JWT).
- **Bookings**:
- `GET /api/bookings`: List bookings (admin, requires JWT).
- `GET /api/bookings/:id`: Get booking details.
- `POST /api/bookings`: Create booking (requires JWT).
- `PUT /api/bookings/:id`: Update booking (admin, requires JWT).
- `Put /api/bookings/:id/cancel`: update booking statues to cancel (requires JWT).
  - **Payments**:
  - `POST /api/payments/create-intent`: Create payment intent.
  - `POST /api/payments/process`: Process payment.
  
  - 
    - 
  - 
  - 
- 
- **Port**:
  - `GET /api/port`: Get backend port.

## Troubleshooting

- **Port Conflicts**:
  - Check ports 9876–9881 (`netstat -tuln`).
  - Set `PORT` in `backend/.env` to a fixed value.
- **API Errors**:
  - Ensure backend is running and `VITE_API_URL` matches the backend port.
  - Test `/api/port` to confirm connectivity.
- **Stripe Payments**:
  - Verify `STRIPE_SECRET_KEY` (backend) and `VITE_STRIPE_PUBLISHABLE_KEY` (frontend).
  - Set up Stripe webhook for `checkout.session.completed`.
- **File Uploads**:
  - Ensure `Uploads/` exists and `FILE_UPLOAD_PATH` is set.
  - Files must be JPEG/PNG, under 5MB.
- **Admin Access**:
  - Login with an admin account to access `/admin` routes.
  - If 401 errors occur, re-login to refresh token.

## Contributing
Fork the repository, create a feature branch, and submit a pull request.

## License
MIT License