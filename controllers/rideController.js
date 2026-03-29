const Ride = require('../models/Ride');
const User = require('../models/User');
const Driver = require('../models/Driver');
const mapService = require('../services/mapService');

exports.createRide = async (req, res) => {
  try {
    const { pickup, destination, pickupCoords, destinationCoords, vehicleType } = req.body;
    
    // Get real distance and duration (can handle strings or coords)
    const distData = await mapService.getDistanceTime(pickupCoords || pickup, destinationCoords || destination);
    const distanceKm = distData.distance.value / 1000;
    const durationMs = distData.duration.value * 1000;

    // Get all fares and choose based on requested vehicleType
    const allFares = await mapService.getFare(distanceKm, durationMs);
    const selectedFare = allFares[vehicleType] || allFares.car;

    // Check Wallet Balance
    const user = await User.findById(req.user.id);
    if (!user.walletBalance || user.walletBalance < selectedFare) {
      return res.status(400).json({ message: 'Insufficient balance. Please top-up your wallet.' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const ride = new Ride({
      user: req.user.id,
      pickup,
      destination,
      fare: selectedFare,
      distance: distanceKm * 1000,
      duration: durationMs / 1000,
      otp
    });
    await ride.save();

    // Notify drivers about the new ride
    const io = req.app.get('io');
    io.emit('new_ride_request', ride);

    res.status(201).json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Error creating ride', error: error.message });
  }
};

exports.acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    
    if (ride.status !== 'pending') return res.status(400).json({ message: 'Ride already accepted or cancelled' });

    ride.captain = req.user.id; // User ID from driverMiddleware auth
    ride.status = 'accepted';
    await ride.save();

    // Notify user that ride is accepted
    const io = req.app.get('io');
    io.emit(`ride_accepted_${ride.user}`, ride);

    res.status(200).json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting ride', error: error.message });
  }
};

exports.completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.status !== 'accepted') return res.status(400).json({ message: 'Ride cannot be completed' });

    ride.status = 'completed';
    await ride.save();

    // Update Wallet Balances (Deduct from User, Credit to Driver)
    const user = await User.findById(ride.user);
    const driver = await Driver.findById(ride.captain);

    user.walletBalance -= ride.fare;
    driver.walletBalance += ride.fare;

    await user.save();
    await driver.save();

    // Notify user
    const io = req.app.get('io');
    io.emit(`ride_completed_${ride.user}`, ride);

    res.status(200).json({ message: 'Ride completed successfully', ride });
  } catch (error) {
    res.status(500).json({ message: 'Error completing ride', error: error.message });
  }
};

exports.cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    ride.status = 'cancelled';
    await ride.save();

    const io = req.app.get('io');
    io.emit(`ride_cancelled_${ride.user}`, ride);

    res.status(200).json({ message: 'Ride cancelled', ride });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling ride', error: error.message });
  }
};
