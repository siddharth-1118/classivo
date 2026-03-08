const express = require('express');
const router = express.Router();
const { getDashboardStats, getAttendanceAnalytics, getFileAnalytics } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/stats', authenticate, authorize('ADMIN'), getDashboardStats);
router.get('/analytics/attendance', authenticate, authorize('ADMIN'), getAttendanceAnalytics);
router.get('/analytics/files', authenticate, authorize('ADMIN'), getFileAnalytics);

module.exports = router;
