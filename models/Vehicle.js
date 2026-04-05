const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['bike', 'car', 'ev'], required: true },
  vehicleType: { type: String, enum: ['mini', 'sedan', 'suv', 'motorcycle', 'auto'], required: true },
  plate: { type: String, required: true, unique: true },
  color: { type: String },
  status: { type: String, enum: ['available', 'rented', 'booked', 'maintenance'], default: 'available' },
  hourlyRate: { type: Number, required: true },
  dailyRate: { type: Number, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  address: { type: String, default: 'Tripzo Hub, Main Square' },
  contactNumber: { type: String, default: '+91 99999 88888' },
  image: { type: String } // URL or file reference
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
