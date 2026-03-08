const express = require('express');
const router = express.Router();
const { getVolunteers, getMyProfile, assignVolunteer, removeVolunteer } = require('../controllers/volunteerController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('ADMIN'), getVolunteers);
router.get('/me', authenticate, authorize('VOLUNTEER'), getMyProfile);
router.post('/assign', authenticate, authorize('ADMIN'), assignVolunteer);
router.delete('/:id', authenticate, authorize('ADMIN'), removeVolunteer);

module.exports = router;
