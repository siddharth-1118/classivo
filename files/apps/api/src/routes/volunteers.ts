import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

// --- Get volunteer by userId ---
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: req.params.userId },
      include: { department: true, class: true }
    });
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
    res.json(volunteer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- Assign volunteer to class (admin only) ---
router.post('/assign', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  const { volunteerId, classId } = req.body;
  try {
    const volunteer = await prisma.volunteer.update({
      where: { id: volunteerId },
      data: { classId }
    });
    res.json(volunteer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;