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

// Security Headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api', limiter);

// Data Sanitization
app.use(mongoSanitize());

// Prevent Parameter Pollution
app.use(hpp());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10kb' }));

// io instance available in routes
app.set('io', io);

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/captains', require('./routes/captainRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
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
