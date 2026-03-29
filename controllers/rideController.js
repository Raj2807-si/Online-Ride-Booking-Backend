const Ride = require('../models/Ride');
const mapService = require('../services/mapService');

exports.createRide = async (req, res) => {
  try {
    const { pickup, destination, vehicleType } = req.body;
    
    // Get real distance and duration
    const distData = await mapService.getDistanceTime(pickup, destination);
    const distanceKm = distData.distance.value / 1000;
    const durationMs = distData.duration.value * 1000;

    // Get all fares and choose based on requested vehicleType
    const allFares = await mapService.getFare(distanceKm, durationMs);
    const selectedFare = allFares[vehicleType] || allFares.car;

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

    ride.captain = req.user.id;
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
