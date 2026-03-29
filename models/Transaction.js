const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  transactionType: { type: String, enum: ['topup', 'payment', 'payout', 'refund'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  referenceId: { type: String }, // UPI transaction ID or similar
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
