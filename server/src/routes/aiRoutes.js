const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { chatWithAssistant, summarizeNotes, analyzeAttendanceRisk } = require('../controllers/aiController');

router.post('/chat', authenticate, chatWithAssistant);
router.post('/summarize', authenticate, summarizeNotes);
router.get('/analyze-attendance', authenticate, analyzeAttendanceRisk);

module.exports = router;
