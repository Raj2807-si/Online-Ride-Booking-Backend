const { authMiddleware, driverMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const { upload } = require('../config/gridfs');

router.post('/register', driverController.registerDriver);
router.post('/login', driverController.loginDriver);
router.post('/update-location', authMiddleware, driverMiddleware, driverController.updateLocation);
router.post('/upload-document', authMiddleware, driverMiddleware, upload.single('document'), driverController.uploadDocument);
router.get('/earnings', authMiddleware, driverMiddleware, driverController.getEarnings);
router.post('/toggle-status', authMiddleware, driverMiddleware, driverController.toggleStatus);

// Admin Routes for Verification
router.get('/pending', authMiddleware, adminMiddleware, driverController.getPendingDrivers);
router.post('/verify/:id', authMiddleware, adminMiddleware, driverController.verifyDriver);
router.get('/document/:fileId', authMiddleware, adminMiddleware, driverController.streamDocument);

module.exports = router;
