const mongoose = require('mongoose');

const captainSchema = new mongoose.Schema({
  fullname: {
    firstname: { type: String, required: true },
    lastname: { type: String }
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  socketId: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
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
  walletBalance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Captain', captainSchema);
