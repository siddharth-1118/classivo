const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { uploadFile, getFilesForClass } = require('../controllers/fileController');
const { sendMessage, getMessages } = require('../controllers/messageController');

// Files
router.post('/files', authenticate, authorize('VOLUNTEER', 'ADMIN'), uploadFile);
router.get('/files', authenticate, getFilesForClass);

// Communication
router.post('/messages', authenticate, sendMessage);
router.get('/messages', authenticate, getMessages);

module.exports = router;
