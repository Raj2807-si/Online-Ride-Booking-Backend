const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

router.get('/all', vehicleController.getAllVehicles);
router.get('/rentals/rider', authMiddleware, vehicleController.getRentalsByRider);
router.get('/rentals/pending', authMiddleware, adminMiddleware, vehicleController.getPendingRentals);
router.post('/rentals/approve/:id', authMiddleware, adminMiddleware, vehicleController.approveRental);
router.post('/rentals/reject/:id', authMiddleware, adminMiddleware, vehicleController.rejectRental);
router.post('/rentals/cancel/:id', authMiddleware, vehicleController.cancelRental);
router.post('/rentals/complete/:id', authMiddleware, vehicleController.completeRental);
router.get('/rentals/stats', authMiddleware, adminMiddleware, vehicleController.getDashboardStats);
router.get('/:id', vehicleController.getVehicleById);
router.post('/book', authMiddleware, vehicleController.bookVehicle);
router.post('/add', authMiddleware, adminMiddleware, vehicleController.addVehicle);

module.exports = router;
