const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'https://online-ride-booking-frontend.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  message: 'Too many requests from this IP'
});
app.use('/api', limiter);

// Data Sanitization
app.use(mongoSanitize());

// Prevent Parameter Pollution
app.use(hpp());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.use(express.json({ limit: '10kb' }));

// io instance available in routes
app.set('io', io);

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join_ride', (rideId) => {
    socket.join(rideId);
    console.log(`Socket ${socket.id} joined ride room: ${rideId}`);
  });

  socket.on('update_location', (data) => {
    const { rideId, lat, lng } = data;
    io.to(rideId).emit('ride_location_update', { lat, lng });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tripzo_ride_booking';

mongoose.connect(DB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
