import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

// --- Signup (student only; volunteers/admin by admin only) ---
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, departmentId, semester, classId, phone } = req.body;

    if (role !== 'STUDENT') return res.status(403).json({ error: 'Only student signup allowed.' });

    // Create Student record
    const student = await prisma.student.create({
      data: { name, email, rollNumber, departmentId, semester: parseInt(semester), classId, phone }
    });
    // Create User record
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: Role.STUDENT,
        studentId: student.id
      }
    });
    return res.status(201).json({ token: generateToken(user) });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// --- Login ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    return res.json({ token: generateToken(user), role: user.role });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// --- Logout (front-end deletes JWT; stateless) ---
router.post('/logout', (req, res) => {
  // Just delete token client side; stateless
  res.json({ success: true });
});

// --- Auth middleware ---
export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export default router;