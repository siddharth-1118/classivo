const express = require('express');
const router = express.Router();
const { getStudents, getStudentById, getMyProfile, updateStudent, deleteStudent, sendDirectMessage, grantEditAccess, updateMyProfile } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('ADMIN', 'VOLUNTEER'), getStudents);
router.get('/me', authenticate, authorize('STUDENT'), getMyProfile);
router.get('/:id', authenticate, authorize('ADMIN'), getStudentById);
router.put('/me', authenticate, authorize('STUDENT'), updateMyProfile);       // student self-edit (one-time)
router.put('/:id', authenticate, authorize('ADMIN'), updateStudent);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteStudent);
// Admin tools
router.post('/:id/notify', authenticate, authorize('ADMIN'), sendDirectMessage);
router.post('/:id/grant-edit', authenticate, authorize('ADMIN'), grantEditAccess); // grant one-time edit

module.exports = router;
