const express = require('express');
const router = express.Router();
const { getClasses, createClass, updateClass, deleteClass } = require('../controllers/classController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getClasses);
router.post('/', authenticate, authorize('ADMIN'), createClass);
router.put('/:id', authenticate, authorize('ADMIN'), updateClass);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteClass);

module.exports = router;
