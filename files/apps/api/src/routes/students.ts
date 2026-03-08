import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

// --- Get student by userId ---
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.userId },
      include: { department: true, class: true }
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- Get subjects for student's class ---
router.get('/:userId/subjects', authMiddleware, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.userId } });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const subjects = await prisma.subject.findMany({ where: { classId: student.classId } });
    res.json(subjects);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- Admin: EDIT student details ---
router.put('/:id', authMiddleware, async (req, res) => {
  // Only admin allowed
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  try {
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;