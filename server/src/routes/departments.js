const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getDepartments);
router.post('/', authenticate, authorize('ADMIN'), createDepartment);
router.put('/:id', authenticate, authorize('ADMIN'), updateDepartment);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteDepartment);

module.exports = router;
