const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullname, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.status(200).json({ token, user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};
const Transaction = require('../models/Transaction');

exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.walletBalance || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching balance', error: error.message });
  }
};

exports.topupWallet = async (req, res) => {
  try {
    const { amount, referenceId } = req.body;
    const user = await User.findById(req.user.id);
    
    user.walletBalance += Number(amount);
    await user.save();

    const transaction = new Transaction({
      userId: user._id,
      amount,
      transactionType: 'topup',
      referenceId,
      description: 'Wallet top-up via UPI'
    });
    await transaction.save();

    res.json({ message: 'Top-up successful', balance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: 'Error topping up wallet', error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};
