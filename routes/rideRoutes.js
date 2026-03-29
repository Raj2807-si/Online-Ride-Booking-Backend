const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { authMiddleware, driverMiddleware } = require('../middlewares/authMiddleware');

router.post('/create', authMiddleware, rideController.createRide);
router.post('/accept/:rideId', authMiddleware, driverMiddleware, rideController.acceptRide);

module.exports = router;
