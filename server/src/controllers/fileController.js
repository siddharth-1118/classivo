const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const prisma = new PrismaClient();

const getFileType = (mimetype) => {
  if (mimetype === 'application/pdf') return 'PDF';
  if (mimetype === 'application/msword') return 'DOC';
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
  if (mimetype.startsWith('image/')) return 'IMAGE';
  return 'OTHER';
};

// POST /files (volunteer or admin)
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required' });
    const { title, description, subjectName, category, classId, departmentId } = req.body;
    if (!title || !subjectName || !classId || !departmentId) {
      return res.status(400).json({ error: 'title, subjectName, classId, departmentId are required' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileType = getFileType(req.file.mimetype);

    // Find or create an uploader record — volunteers have one, admins may not
    let uploadedById;
    if (req.user.role === 'ADMIN') {
      // For admin, find or create a special admin volunteer record
      let adminVolunteer = await prisma.volunteer.findUnique({ where: { userId: req.user.id } });
      if (!adminVolunteer) {
        // Use the first available class/dept or the ones provided
        adminVolunteer = await prisma.volunteer.create({
          data: { userId: req.user.id, departmentId, classId },
        });
      }
      uploadedById = adminVolunteer.id;
    } else {
      const volunteer = await prisma.volunteer.findUnique({ where: { userId: req.user.id } });
      if (!volunteer) return res.status(403).json({ error: 'Only volunteers or admins can upload files' });
      uploadedById = volunteer.id;
    }

    const file = await prisma.file.create({
      data: {
        title,
        description,
        subjectName,
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType,
        category: category || 'STUDY_MATERIAL',
        departmentId,
        classId,
        uploadedById,
      },
      include: { department: true, class: true, uploader: { include: { user: { select: { name: true } } } } },
    });

    // Notify all students in that class
    const students = await prisma.student.findMany({
      where: { classId },
      include: { user: true },
    });

    for (const student of students) {
      await prisma.notification.create({
        data: {
          userId: student.userId,
          type: 'FILE_UPLOAD',
          title: 'New file uploaded',
          message: `New ${fileType} uploaded: "${title}" for ${subjectName}`,
          link: '/files',
        },
      });
    }

    res.status(201).json(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

// GET /files
const getFilesForClass = async (req, res) => {
  try {
    const { classId, departmentId, subjectName, category, search } = req.query;
    const where = {};

    // Students only see files for their class
    if (req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student) return res.json([]); 
      where.classId = student.classId;
    } else {
      if (classId) where.classId = classId;
      if (departmentId) where.departmentId = departmentId;
    }

    if (subjectName) where.subjectName = { contains: subjectName, mode: 'insensitive' };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subjectName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const files = await prisma.file.findMany({
      where,
      include: {
        department: true,
        class: true,
        uploader: { include: { user: { select: { name: true } } } },
        _count: { select: { downloads: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

// GET /files/:id/download
const downloadFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ error: 'File not found' });

    // Track download
    await prisma.download.create({
      data: { fileId: file.id, userId: req.user.id },
    });

    const filePath = path.join(__dirname, '../../', file.fileUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk' });

    res.download(filePath, file.fileName);
  } catch (err) {
    res.status(500).json({ error: 'Failed to download file' });
  }
};

// DELETE /files/:id (admin or uploader volunteer)
const deleteFile = async (req, res) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ error: 'File not found' });

    if (req.user.role !== 'ADMIN') {
      const volunteer = await prisma.volunteer.findUnique({ where: { userId: req.user.id } });
      if (!volunteer || file.uploadedById !== volunteer.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // Delete physical file
    const filePath = path.join(__dirname, '../../', file.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.file.delete({ where: { id: req.params.id } });
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

module.exports = { uploadFile, getFilesForClass, downloadFile, deleteFile };
