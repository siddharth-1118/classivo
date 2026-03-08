const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationRead, markAllRead, createBroadcastNotification } = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getNotifications);
router.put('/read-all', authenticate, markAllRead);
router.put('/:id/read', authenticate, markNotificationRead);
router.post('/broadcast', authenticate, authorize('ADMIN'), createBroadcastNotification);

module.exports = router;
