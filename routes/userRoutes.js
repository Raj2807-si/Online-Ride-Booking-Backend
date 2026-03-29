const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/wallet/balance', authMiddleware, userController.getWalletBalance);
router.post('/wallet/topup', authMiddleware, userController.topupWallet);
router.get('/wallet/transactions', authMiddleware, userController.getTransactions);

module.exports = router;
