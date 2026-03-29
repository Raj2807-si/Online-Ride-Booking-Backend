const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  captain: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  pickup: { type: String, required: true },
  pickupCoords: {
    lat: { type: Number },
    lng: { type: Number }
  },
  destination: { type: String, required: true },
  destinationCoords: {
    lat: { type: Number },
    lng: { type: Number }
  },
  fare: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'], default: 'pending' },
  duration: { type: Number }, // in seconds
  distance: { type: Number }, // in meters
  otp: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
