import express from 'express';
import { PrismaClient, AttendanceType } from '@prisma/client';
import multer from 'multer';

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/attendance/' });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { studentId, subjectId, type, value } = req.body;
    let fileUrl = null;
    if (type === AttendanceType.SCREENSHOT || type === AttendanceType.PDF) {
      fileUrl = `/uploads/attendance/${req.file.filename}`;
    }
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        subjectId,
        type,
        value: value ? parseFloat(value) : 0,
        fileUrl
      }
    });
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/manual', async (req, res) => {
  try {
    const { studentId, subjectId, value } = req.body;
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        subjectId,
        type: AttendanceType.MANUAL,
        value: parseFloat(value)
      }
    });
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;