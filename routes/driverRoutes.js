const express = require('express');
const router = express.Router();
const { authMiddleware, driverMiddleware } = require('../middlewares/authMiddleware');

router.post('/register', driverController.registerDriver);
router.post('/login', driverController.loginDriver);
router.post('/update-location', authMiddleware, driverMiddleware, driverController.updateLocation);

module.exports = router;
