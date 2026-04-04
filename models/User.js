const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    firstname: { type: String, required: true },
    lastname: { type: String }
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  socketId: { type: String },
  walletBalance: { type: Number, default: 0 },
  licenseNumber: { type: String },
  documents: [{
    fileName: { type: String },
    fileId: { type: mongoose.Schema.Types.ObjectId }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
