import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/files/' });

// --- Upload file (volunteer) ---
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (req.user.role !== 'VOLUNTEER') return res.status(403).json({ error: 'Forbidden' });
  
  const { title, description, category, departmentId, classId, subjectId } = req.body;
  try {
    const file = await prisma.file.create({
      data: {
        title,
        description,
        category,
        filename: req.file.originalname,
        url: `/uploads/files/${req.file.filename}`,
        departmentId,
        classId,
        subjectId,
        volunteerId: req.user.volunteerId
      }
    });
    res.status(201).json(file);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- Search/filter by class and subject (student) ---
router.get('/', authMiddleware, async (req, res) => {
  const { classId, subject } = req.query;
  try {
    const files = await prisma.file.findMany({
      where: {
        classId: classId as string,
        ...(subject ? { subject: { name: { contains: subject as string } } } : {})
      },
      include: { subject: true }
    });
    res.json(files);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- Delete file (admin) ---
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  try {
    await prisma.file.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;