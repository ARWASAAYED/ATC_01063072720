# EventBookingApp

A full-stack event booking application with a React frontend and Node.js/Express/MongoDB backend. Users can browse events, view speaker profiles, book events, make secure payments via Stripe(fake), and manage bookings. The backend supports dynamic port allocation and image uploads for events and speakers.

## Features
- **Browse Content**: View featured events, popular destinations, and speaker profiles.
- **Event Booking**: Select tickets and book events with Stripe payment integration.
- **Booking Management**: View and cancel bookings in a user dashboard.
- **Authentication**: Secure user registration, login, and profile management.
- **File Uploads**: Upload images for events and speakers (e.g., `/uploads/jane-smith.jpg`). 
- **Dynamic Ports**: Backend automatically selects a free port (9876–9881) with frontend auto-detection.
- **Responsive Design**: Built with React, Bootstrap, and Framer Motion for a smooth UI.

## Project Structure
```
EventBookingApp/
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
│   ├── src/          # React components, utils
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
- **VS Code** (optional): For editing and Git integration

## Setup Instructions

1. **Clone the Repository** (after creating it):
   ```bash
   git clone https://github.com/<your-username>/EventBookingApp.git
   cd EventBookingApp
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
     MONGODB_URI=mongodb://localhost:27017/event-booking
     JWT_SECRET=your_jwt_secret_here
     MAX_FILE_UPLOAD=5000000
     CLIENT_URL=http://localhost:5174
     NODE_ENV=development
     ```
   - Create `Uploads/` directory:
     ```bash
     mkdir Uploads
     ```
   - Add sample images (e.g., `jane-smith.jpg`) to `Uploads/` for testing.

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
     VITE_API_URL=http://localhost:9881/api
     ```
   - Create `public/images/` for placeholders:
     ```bash
     mkdir -p public/images
     ```
   - Add images (e.g., `default-speaker.jpg`, `default-event.jpg`).

4. **Seed the Database**:
   - Connect to MongoDB:
     ```bash
     mongosh
     ```
   - Insert test data:
     ```javascript
     use eventbooking
     db.users.insertOne({
       email: "test@example.com",
       password: "$2a$10$examplehashedpassword"
     })
     db.speakers.insertOne({
       _id: ObjectId("507f191e810c19729de860ea"),
       name: "Jane Smith",
       position: "Motivational Speaker",
       company: "Inspire Inc",
       profileImage: "/uploads/jane-smith.jpg",
       expertise: ["Leadership"],
       events: [ObjectId("507f1f77bcf86cd799439012")]
     })
     db.events.insertOne({
       _id: ObjectId("507f1f77bcf86cd799439012"),
       title: "Summer Concert",
       category: "Music",
       description: "An exciting concert",
       startDate: ISODate("2025-06-01T18:00:00Z"),
       tickets: [{ type: "General", price: 50 }],
       image: "default-event.jpg",
       isFeatured: true
     })
     ```

5. **Run the Application**:
   - Start the backend:
     ```bash
     cd backend
     npm run dev
     ```
     - Note the port (e.g., 9876) from the console (`Server running on port ...`).
   - Start the frontend:
     ```bash
     cd ../frontend
     npm run dev
     ```
     - Open `http://localhost:5174` (Vite’s default port).
   - The frontend will auto-detect the backend port via `/api/port`.

6. **Test the Application**:
   - **Register/Login**: Use `/login` (e.g., POST to `/api/auth/login` with `email: test@example.com`).
   - **Browse**: Visit `/` to see events and speakers.
   - **Book Event**: Go to `/event/507f1f77bcf86cd799439012`, select tickets, and pay with Stripe test card (`4242 4242 4242 4242`, any future expiry, any CVC).
   - **View Bookings**: Check `/my-bookings` for booking history.
   - **Upload Image**: Test `/api/upload` with a JPEG/PNG file (e.g., via Postman).

## Creating the GitHub Repository

1. **Create a Repository**:
   - Go to `https://github.com/new`.
   - Name: `EventBookingApp`.
   - Visibility: Public.
   - Initialize with a README: Uncheck (using this `README.md`).
   - Click “Create repository”.

2. **Push the Project Using VS Code**:
   - Open `EventBookingApp/` in VS Code (`File > Open Folder`).
   - Ensure `.gitignore` includes:
     ```
     node_modules/
     .env
     backend/Uploads/*
     frontend/dist/
     ```
   - Initialize Git:
     - Open Source Control (`Ctrl+Shift+G`).
     - Click “Initialize Repository”.
   - Stage files:
     - Click `+` next to files or “Stage All Changes”.
   - Commit:
     - Enter message: “Initial commit with full-stack event booking app”.
     - Click the checkmark or `Ctrl+Enter`.
   - Add remote:
     - Click `...` > “Remote > Add Remote”.
     - Paste: `https://github.com/<your-username>/EventBookingApp.git`.
     - Name: `origin`.
   - Push:
     - Click `...` > “Push to” > `origin`.
     - Authenticate with GitHub (use a personal access token if needed).
   - Alternatively, use the terminal:
     ```bash
     git add .
     git commit -m "Initial commit with full-stack event booking app"
     git branch -M main
     git remote add origin https://github.com/<your-username>/EventBookingApp.git
     git push -u origin main
     ```

## API Endpoints

- **Auth**:
  - `POST /api/auth/register`: `{ name, email, password }` → Register user.
  - `POST /api/auth/login`: `{ email, password }` → Login, get JWT.
  - `GET /api/auth/me`: Get current user (requires JWT).
  - `PUT /api/auth/updatedetails`: Update user profile (requires JWT).
  - `PUT /api/auth/updatepassword`: Update password (requires JWT).
- **Users**:
  - `GET /api/users`: Get all users (requires JWT, admin).
- **Events**:
  - `GET /api/events`: Get events (supports `isFeatured`, `limit`).
  - `GET /api/events/:id`: Get event by ID.
  - `POST /api/events`: Create event (requires JWT).
  - `PUT /api/events/:id`: Update event (requires JWT).
  - `DELETE /api/events/:id`: Delete event (requires JWT).
- **Venues**:
  - `GET /api/venues`: Get all venues.
  - `GET /api/venues/:id`: Get venue by ID.
  - `POST /api/venues`: Create venue (requires JWT).
  - `PUT /api/venues/:id`: Update venue (requires JWT).
  - `DELETE /api/venues/:id`: Delete venue (requires JWT).
- **Speakers**:
  - `GET /api/speakers`: Get all speakers.
  - `GET /api/speakers/:id`: Get speaker by ID.
- **Bookings**:
  - `GET /api/bookings`: Get user bookings (requires JWT).
  - `GET /api/bookings/:id`: Get booking by ID (requires JWT).
  - `POST /api/bookings`: Create booking `{ eventId, tickets }` (requires JWT).
  - `PUT /api/bookings/:id/cancel`: Cancel booking (requires JWT).
- **Payments**:
- - `POST /api/payments/process`: 
  - `POST /api/payments/create-intent`: 
- **Uploads**:
  - `POST /api/upload`: Upload image (JPEG/PNG, max 5MB, requires JWT).
- **Port**:
  - `GET /api/port`: Get current backend port.

## Testing APIs (Using Postman)

- **Set Authorization**:
  - Add `Authorization: Bearer <token>` for protected routes (get token from `/api/auth/login`).
- **Example: Login**:
  ```plaintext
  POST http://localhost:9876/api/auth/login
  Content-Type: application/json
  {
    "email": "test@example.com",
    "password": "password"
  }
  ```
- **Example: Create Booking**:
  ```plaintext
  POST http://localhost:9881/api/bookings
  Authorization: Bearer <token>
  Content-Type: application/json
  {
    "eventId": "507f1f77bcf86cd799439012",
    "tickets": [{ "type": "General", "quantity": 2 }]
  }
  ```
- **Example: Upload Image**:
  ```plaintext
  POST http://localhost:9876/api/upload
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
  [Select file: jane-smith.jpg]
  ```

## Editing README in VS Code

- **Open `README.md`**:
  - In VS Code, open `EventBookingApp/README.md`.
- **Use Markdown Preview**:
  - Press `Ctrl+Shift+V` (or `Cmd+Shift+V` on macOS) to preview formatting.
- **Install Extensions** (optional):
  - **Markdown All in One**: For auto-formatting, table of contents, and shortcuts.
    - Install: `Ctrl+Shift+X`, search “Markdown All in One”, click Install.
    - Use: Type `#` for headings, `-` for lists, or `Ctrl+Shift+T` for a TOC.
  - **GitHub Copilot** (if available):
    - Prompt: `<!-- Add troubleshooting for file uploads -->`.
    - Example output:
      ```markdown
      - **File Uploads Fail**:
        - Ensure `Uploads/` exists and is writable.
        - Verify file is JPEG/PNG and under 5MB.
        - Check `FILE_UPLOAD_PATH` in `backend/.env`.
      ```
- **Snippets**:
  - Create a markdown snippet:
    - `File > Preferences > User Snippets > markdown.json`.
    - Add:
      ```json
      {
        "README Section": {
          "prefix": "readme-section",
          "body": ["## $1", "$2", ""],
          "description": "Create a README section"
        }
      }
      ```
    - Type `readme-section` to add sections like “Troubleshooting”.

## Troubleshooting

- **MongoDB**:
  - Ensure MongoDB is running and `MONGODB_URI` is correct.
  - Test: `mongosh mongodb://localhost:27017/event-booking`.
- **Backend Port**:
  - If port detection fails, check ports 9876–9881 are free (`netstat -tuln`).
  - Set `PORT` in `backend/.env` to a fixed value if needed.
- **Frontend API**:
  - If `VITE_API_URL` fails, ensure backend is running and `/api/port` responds.
  - Fallback: Update `VITE_API_URL` to match backend port.

- **File Uploads**:
  - Check `Uploads/` permissions and `FILE_UPLOAD_PATH`.
  - Ensure files are JPEG/PNG and under 5MB.
- **Authentication**:
  - If 401 errors occur, re-login to refresh token.
  - Clear `localStorage` if redirected to `/login`.
- **VS Code Git**:
  - Ensure Git is installed (`git --version`).
  - Use a personal access token for GitHub authentication.

## Contributing
Fork the repository, create a feature branch, and submit a pull request.

## License
MIT License