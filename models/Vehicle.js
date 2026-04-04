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
  image: { type: String } // URL or file reference
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
