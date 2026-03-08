const express = require('express');
const router = express.Router();
const { sendQuery, getQueries, replyToQuery } = require('../controllers/queryController');
const { authenticate, authorize } = require('../middleware/auth');

// Students send queries; admin/volunteer can view all
router.get('/', authenticate, getQueries);
router.post('/', authenticate, authorize('STUDENT'), sendQuery);
router.post('/:id/reply', authenticate, authorize('ADMIN', 'VOLUNTEER'), replyToQuery);

module.exports = router;
