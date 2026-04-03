const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { authMiddleware, driverMiddleware } = require('../middlewares/authMiddleware');

router.post('/create', authMiddleware, rideController.createRide);
router.post('/accept/:rideId', authMiddleware, driverMiddleware, rideController.acceptRide);
router.post('/start', authMiddleware, driverMiddleware, rideController.startRide);
router.post('/complete/:rideId', authMiddleware, driverMiddleware, rideController.completeRide);
router.post('/process-payment', authMiddleware, rideController.processPayment);
router.post('/cancel/:rideId', authMiddleware, rideController.cancelRide);
router.get('/geocode', authMiddleware, rideController.geocode);
router.post('/rate/:rideId', authMiddleware, rideController.submitRating);
router.get('/history/rider', authMiddleware, rideController.getRiderHistory);
router.get('/history/captain', authMiddleware, driverMiddleware, rideController.getCaptainHistory);

module.exports = router;
