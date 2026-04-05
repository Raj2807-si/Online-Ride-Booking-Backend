const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  fullname: {
    firstname: { type: String, required: true },
    lastname: { type: String }
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  socketId: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  isVerified: { type: Boolean, default: false },
  serviceType: { type: String, enum: ['self-driving', 'with-driver'], default: 'with-driver' },
  currentLocation: { type: String },
  vehicle: {
    color: { type: String },
    plate: { type: String },
    capacity: { type: Number },
    vehicleType: { type: String, enum: ['car', 'motorcycle', 'auto'] }
  },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  walletBalance: { type: Number, default: 0 },
  ratings: { type: Number, default: 0 },
  documents: [{
    fileName: String,
    fileId: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
