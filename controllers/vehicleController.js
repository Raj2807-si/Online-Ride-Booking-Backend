const Vehicle = require('../models/Vehicle');

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: 'available' });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicle details', error: error.message });
  }
};

exports.bookVehicle = async (req, res) => {
  try {
    const { vehicleId, duration, durationType } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.status !== 'available') {
      return res.status(400).json({ message: 'Vehicle not available' });
    }

    const price = durationType === 'daily' ? vehicle.dailyRate * duration : vehicle.hourlyRate * duration;

    // Check Wallet Balance
    const user = await User.findById(req.user.id);
    if (!user.walletBalance || user.walletBalance < price) {
      return res.status(400).json({ message: 'Insufficient balance. Please top-up your wallet.' });
    }

    // Deduct from wallet
    user.walletBalance -= price;
    await user.save();

    // Update vehicle status
    vehicle.status = 'rented';
    await vehicle.save();

    res.json({ message: 'Vehicle booked successfully', vehicle });
  } catch (error) {
    res.status(500).json({ message: 'Error booking vehicle', error: error.message });
  }
};

// Admin only: Add new vehicle
exports.addVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Error adding vehicle', error: error.message });
  }
};
