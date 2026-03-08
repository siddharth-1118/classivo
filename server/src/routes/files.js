const express = require('express');
const router = express.Router();
const { uploadFile, getFilesForClass, downloadFile, deleteFile } = require('../controllers/fileController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', authenticate, getFilesForClass);
router.post('/', authenticate, authorize('VOLUNTEER', 'ADMIN'), upload.single('file'), uploadFile);
router.get('/:id/download', authenticate, downloadFile);
router.delete('/:id', authenticate, authorize('ADMIN', 'VOLUNTEER'), deleteFile);

module.exports = router;
