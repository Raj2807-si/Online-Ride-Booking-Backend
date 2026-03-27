const express = require('express');
const router = express.Router();
const captainController = require('../controllers/captainController');

router.post('/register', captainController.registerCaptain);
router.post('/login', captainController.loginCaptain);

module.exports = router;
