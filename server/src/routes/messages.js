const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getMessageThread, markRead, deleteMessage } = require('../controllers/messageController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getMessages);
// Only ADMIN and VOLUNTEER can send messages (students use /queries)
router.post('/', authenticate, authorize('ADMIN', 'VOLUNTEER'), sendMessage);
router.get('/:id', authenticate, getMessageThread);
router.put('/:id/read', authenticate, markRead);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteMessage);

module.exports = router;
