const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.post('/broadcast', authorize('admin'), notificationController.broadcast);

module.exports = router;
