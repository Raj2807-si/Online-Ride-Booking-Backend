const Captain = require('../models/Captain');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerCaptain = async (req, res) => {
  try {
    const { fullname, email, password, vehicle } = req.body;
    const existingCaptain = await Captain.findOne({ email });
    if (existingCaptain) return res.status(400).json({ message: 'Captain already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const captain = new Captain({ fullname, email, password: hashedPassword, vehicle });
    await captain.save();

    const token = jwt.sign({ id: captain._id, role: 'captain' }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.status(201).json({ token, captain: { id: captain._id, fullname: captain.fullname, email: captain.email, vehicle: captain.vehicle } });
  } catch (error) {
    res.status(500).json({ message: 'Error registering captain', error: error.message });
  }
};

exports.loginCaptain = async (req, res) => {
  try {
    const { email, password } = req.body;
    const captain = await Captain.findOne({ email });
    if (!captain) return res.status(404).json({ message: 'Captain not found' });

    const isMatch = await bcrypt.compare(password, captain.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: captain._id, role: 'captain' }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.status(200).json({ token, captain: { id: captain._id, fullname: captain.fullname, email: captain.email, status: captain.status } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};
