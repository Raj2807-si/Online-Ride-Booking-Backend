const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  duration: { type: Number, required: true },
  durationType: { type: String, enum: ['daily', 'hourly'], required: true },
  totalCost: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  pickupTime: { type: Date },
  returnTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Rental', rentalSchema);
