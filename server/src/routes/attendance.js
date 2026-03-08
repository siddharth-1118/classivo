const express = require('express');
const router = express.Router();
const { uploadAttendance, getMyAttendance, getStudentAttendance, getClassAttendance } = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');
const { attendanceUpload } = require('../middleware/upload');

router.post('/', authenticate, authorize('STUDENT'), attendanceUpload.single('file'), uploadAttendance);
router.get('/me', authenticate, authorize('STUDENT'), getMyAttendance);
router.get('/class/:classId', authenticate, authorize('ADMIN'), getClassAttendance);
router.get('/:studentId', authenticate, authorize('ADMIN'), getStudentAttendance);

module.exports = router;
