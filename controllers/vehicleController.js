const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Rental = require('../models/Rental');

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
    const currentUser = await User.findById(req.user.id);

    if (!currentUser.licenseNumber) {
      return res.status(400).json({ message: 'Driving license required for self-driving rentals.' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.status !== 'available') {
      return res.status(400).json({ message: 'Vehicle not available' });
    }

    const price = durationType === 'daily' ? vehicle.dailyRate * duration : vehicle.hourlyRate * duration;

    // Check Wallet Balance
    if (!currentUser.walletBalance || currentUser.walletBalance < price) {
      return res.status(400).json({ message: 'Insufficient balance. Please top-up your wallet.' });
    }

    // Create Rental Record (Pending Verification)
    const rental = new Rental({
        user: currentUser._id,
        vehicle: vehicle._id,
        duration,
        durationType,
        totalCost: price,
        status: 'pending'
    });
    await rental.save();

    // Deduct from wallet
    currentUser.walletBalance -= price;
    await currentUser.save();

    // Update vehicle status temporarily to 'booked'
    vehicle.status = 'booked';
    await vehicle.save();

    res.json({ message: 'Booking request sent! Awaiting admin approval.', rental });
  } catch (error) {
    res.status(500).json({ message: 'Error booking vehicle', error: error.message });
  }
};

exports.getRentalsByRider = async (req, res) => {
    try {
        const rentals = await Rental.find({ user: req.user.id })
            .populate('vehicle')
            .sort({ createdAt: -1 });
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your rentals', error: error.message });
    }
};

exports.getPendingRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ status: 'pending' })
            .populate('user')
            .populate('vehicle');
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending rentals', error: error.message });
    }
};

exports.approveRental = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id);
        if (!rental) return res.status(404).json({ message: 'Rental not found' });
        
        rental.status = 'active';
        rental.pickupTime = new Date();
        await rental.save();

        const vehicle = await Vehicle.findById(rental.vehicle);
        vehicle.status = 'rented';
        await vehicle.save();

        res.json({ message: 'Rental approved and activated!', rental });
    } catch (error) {
        res.status(500).json({ message: 'Error approving rental', error: error.message });
    }
};

exports.rejectRental = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id).populate('user');
        if (!rental) return res.status(404).json({ message: 'Rental not found' });
        
        if (rental.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending rentals can be rejected.' });
        }

        // Refund user
        const user = await User.findById(rental.user._id);
        if (user) {
            user.walletBalance += rental.totalCost;
            await user.save();
        }

        rental.status = 'cancelled';
        await rental.save();

        const vehicle = await Vehicle.findById(rental.vehicle);
        vehicle.status = 'available';
        await vehicle.save();

        res.json({ message: 'Rental rejected and user refunded.', rental });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting rental', error: error.message });
    }
};

exports.cancelRental = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id);
        if (!rental) return res.status(404).json({ message: 'Rental not found' });
        
        // Ensure user owns this rental
        if (rental.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        if (rental.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending rentals can be cancelled.' });
        }

        // Refund user
        const user = await User.findById(req.user.id);
        user.walletBalance += rental.totalCost;
        await user.save();

        rental.status = 'cancelled';
        await rental.save();

        const vehicle = await Vehicle.findById(rental.vehicle);
        vehicle.status = 'available';
        await vehicle.save();

        res.json({ message: 'Rental cancelled and wallet refunded.', rental });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling rental', error: error.message });
    }
};

exports.completeRental = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id);
        if (!rental) return res.status(404).json({ message: 'Rental not found' });
        
        // Security: Ensure only the renter or admin can complete the rental
        if (rental.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized. You can only complete your own rentals.' });
        }
        
        rental.status = 'completed';
        rental.returnTime = new Date();
        await rental.save();

        const vehicle = await Vehicle.findById(rental.vehicle);
        vehicle.status = 'available';
        await vehicle.save();

        res.json({ message: 'Rental completed!', rental });
    } catch (error) {
        res.status(500).json({ message: 'Error completing rental', error: error.message });
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
