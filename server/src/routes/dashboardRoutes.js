const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getStudentStats, getAdminStats, getVolunteerStats } = require('../controllers/dashboardController');

router.get('/student', authenticate, authorize('STUDENT'), getStudentStats);
router.get('/admin', authenticate, authorize('ADMIN'), getAdminStats);
router.get('/volunteer', authenticate, authorize('VOLUNTEER'), getVolunteerStats);

module.exports = router;
