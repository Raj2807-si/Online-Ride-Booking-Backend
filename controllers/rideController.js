const Ride = require('../models/Ride');

exports.createRide = async (req, res) => {
  try {
    const { pickup, destination, fare, distance, duration } = req.body;
    // OTP generator
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const ride = new Ride({
      user: req.user.id,
      pickup,
      destination,
      fare,
      distance,
      duration,
      otp
    });
    await ride.save();

    // Notify captains about the new ride (using socket.io)
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
