const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { getProfile, updateProfile, getSubjects } = require('../controllers/studentController');
const { uploadAttendance, getStudentAttendance } = require('../controllers/attendanceController');
const { getStudentStats } = require('../controllers/dashboardController');

// Profile
router.get('/profile', authMiddleware, getProfile);
router.get('/:userId/subjects', authMiddleware, getSubjects);
router.put('/profile/:userId', authMiddleware, updateProfile);

// Attendance
router.post('/attendance', authMiddleware, roleMiddleware(['STUDENT']), uploadAttendance);
router.get('/attendance', authMiddleware, getStudentAttendance);
router.get('/dashboard-stats', authMiddleware, getStudentStats);

module.exports = router;
