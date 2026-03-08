const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getSubjects);
router.post('/', authenticate, authorize('ADMIN'), createSubject);
router.put('/:id', authenticate, authorize('ADMIN'), updateSubject);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSubject);

module.exports = router;
