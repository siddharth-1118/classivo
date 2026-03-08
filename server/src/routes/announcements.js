const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getAnnouncements);
router.post('/', authenticate, authorize('ADMIN'), createAnnouncement);
router.put('/:id', authenticate, authorize('ADMIN'), updateAnnouncement);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteAnnouncement);

module.exports = router;
