const Driver = require('../models/Driver');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerDriver = async (req, res) => {
  try {
    const { fullname, email, password, vehicle } = req.body;
    const existingDriver = await Driver.findOne({ email });
    if (existingDriver) return res.status(400).json({ message: 'Driver already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const driver = new Driver({ fullname, email, password: hashedPassword, vehicle });
    await driver.save();

    const token = jwt.sign({ id: driver._id, role: 'driver' }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.status(201).json({ token, driver: { id: driver._id, fullname: driver.fullname, email: driver.email, vehicle: driver.vehicle } });
  } catch (error) {
    res.status(500).json({ message: 'Error registering driver', error: error.message });
  }
};

exports.loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;
    const driver = await Driver.findOne({ email });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: driver._id, role: 'driver' }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.status(200).json({ token, driver: { id: driver._id, fullname: driver.fullname, email: driver.email, status: driver.status, isVerified: driver.isVerified } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const driver = await Driver.findByIdAndUpdate(req.user.id, {
      location: { lat, lng }
    }, { new: true });

    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    // Emit to socket room for real-time tracking (to be implemented more specifically in Phase 4)
    const io = req.app.get('io');
    io.emit('driver_location_update', { driverId: driver._id, location: driver.location });

    res.status(200).json({ status: 'success', location: driver.location });
  } catch (error) {
    res.status(500).json({ message: 'Error updating location', error: error.message });
  }
};
