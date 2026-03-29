const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

router.get('/all', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.post('/book', authMiddleware, vehicleController.bookVehicle);
router.post('/add', authMiddleware, adminMiddleware, vehicleController.addVehicle);

module.exports = router;
