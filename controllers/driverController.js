const Driver = require('../models/Driver');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { getBucket } = require('../config/gridfs');

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
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    const driver = await Driver.findOne({ email });
    if (!driver) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: driver._id, role: 'driver' }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.status(200).json({ token, driver: { id: driver._id, fullname: driver.fullname, email: driver.email, vehicle: driver.vehicle, isVerified: driver.isVerified } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const driver = await Driver.findByIdAndUpdate(req.user.id, { location: { lat, lng } }, { new: true });
    
    // Broadcast location update
    const io = req.app.get('io');
    io.emit('driver_location_update', { driverId: driver._id, lat, lng });

    res.json({ message: 'Location updated', location: driver.location });
  } catch (error) {
    res.status(500).json({ message: 'Error updating location', error: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const driver = await Driver.findById(req.user.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    driver.documents = driver.documents || [];
    driver.documents.push({
      fileName: req.file.originalname,
      fileId: req.file.id
    });
    
    await driver.save();
    res.status(200).json({ status: 'success', file: req.file });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
};

exports.getEarnings = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id);
    res.json({ earnings: driver.walletBalance || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching earnings', error: error.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { status } = req.body; // active or inactive
    const driver = await Driver.findByIdAndUpdate(req.user.id, { status }, { new: true });
    
    // Broadcast status change
    const io = req.app.get('io');
    io.emit('driver_status_update', { driverId: driver._id, status: driver.status });

    res.json({ message: `Status updated to ${status}`, status: driver.status });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

exports.getPendingDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ isVerified: false });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending drivers', error: error.message });
  }
};

exports.verifyDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findByIdAndUpdate(id, { isVerified: true }, { new: true });
    res.json({ message: 'Driver verified successfully', driver });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying driver', error: error.message });
  }
};

exports.streamDocument = async (req, res) => {
  try {
    const { fileId } = req.params;
    const bucket = getBucket();
    if (!bucket) return res.status(500).json({ message: 'GridFS Bucket not ready' });

    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    
    downloadStream.on('error', (err) => {
      res.status(404).json({ message: 'File not found' });
    });

    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: 'Error streaming document', error: error.message });
  }
};
