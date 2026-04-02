const Ride = require('../models/Ride');
const User = require('../models/User');
const Driver = require('../models/Driver');
const mapService = require('../services/mapService');
const axios = require('axios');

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

    /* Removed initial balance check to allow "Connect First" flow */

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

exports.startRide = async (req, res) => {
  try {
    const { rideId, otp } = req.body;
    const ride = await Ride.findById(rideId).populate('user captain');
    
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.status !== 'accepted') return res.status(400).json({ message: 'Ride not accepted yet' });
    if (ride.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    ride.status = 'ongoing';
    await ride.save();

    // Notify user that ride has started
    const io = req.app.get('io');
    io.emit(`ride_started_${ride.user._id}`, ride);

    res.status(200).json({ message: 'Ride started successfully', ride });
  } catch (error) {
    res.status(500).json({ message: 'Error starting ride', error: error.message });
  }
};

exports.completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.status !== 'ongoing' && ride.status !== 'accepted') {
      return res.status(400).json({ message: 'Ride cannot be completed from current state' });
    }

    ride.status = 'completed';
    await ride.save();

    // Notify user to start payment process
    const io = req.app.get('io');
    io.emit(`ride_completed_${ride.user}`, ride);

    res.status(200).json({ message: 'Ride completed successfully', ride });
  } catch (error) {
    res.status(500).json({ message: 'Error completing ride', error: error.message });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { rideId, paymentMethod } = req.body;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.paymentStatus === 'paid') return res.status(400).json({ message: 'Ride already paid' });

    ride.paymentMethod = paymentMethod;
    ride.paymentStatus = 'paid';
    await ride.save();

    if (paymentMethod === 'wallet') {
      const user = await User.findById(ride.user);
      const driver = await Driver.findById(ride.captain);

      if (user && driver) {
        user.walletBalance = (user.walletBalance || 0) - ride.fare;
        driver.walletBalance = (driver.walletBalance || 0) + ride.fare;

        await user.save();
        await driver.save();
      }
    }

    // Notify driver about payment confirmation
    const io = req.app.get('io');
    io.emit(`payment_confirmed_${ride.captain}`, { rideId, paymentMethod });

    res.status(200).json({ message: 'Payment processed successfully', ride });
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment', error: error.message });
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

exports.geocode = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query parameter q is required' });

    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q,
        format: 'json',
        addressdetails: 1,
        limit: req.query.limit || 5
      },
      headers: {
        'User-Agent': 'Tripzo-Ride-Booking-App'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Geocoding proxy error:', error.message);
    res.status(500).json({ message: 'Error fetching geocode data', error: error.message });
  }
};
