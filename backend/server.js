const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const portfinder = require('portfinder');


dotenv.config();


if (!fs.existsSync(process.env.FILE_UPLOAD_PATH)) {
  fs.mkdirSync(process.env.FILE_UPLOAD_PATH, { recursive: true });
}

connectDB();

const app = express();


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, process.env.FILE_UPLOAD_PATH);
  },
  filename: function(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});


const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_UPLOAD, 10) },
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images Only!'));
    }
  }
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));


console.log('CORS origin:', process.env.CLIENT_URL || 'http://localhost:5174');
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));





app.get('/api/port', (req, res) => {
  res.json({ port: app._port || process.env.PORT || 9876 });
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/events', require('./routes/events'));
app.use('/api/venues', require('./routes/venues'));
app.use('/api/speakers', require('./routes/speakers'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));




if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

app.use(express.static(path.join(__dirname, 'public')));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const defaultPort = process.env.PORT || 9876;
portfinder.getPort({ port: defaultPort }, (err, port) => {
  if (err) {
    console.error('Error finding a free port:', err);
    process.exit(1);
  }
  app._port = port; // Store port for /api/port endpoint
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});