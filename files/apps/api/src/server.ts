import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Import routes (will be implemented next)
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import volunteerRoutes from './routes/volunteers';
import fileRoutes from './routes/files';
import attendanceRoutes from './routes/attendance';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Classivo API running on port ${port}`));