const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /students
const getStudents = async (req, res) => {
  try {
    const { departmentId, classId, search } = req.query;
    
    // We want to find all users with role STUDENT
    const where = { role: 'STUDENT' };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { student: { rollNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: { 
        student: {
          include: { department: true, class: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to match the expected student format or handle null profiles
    const result = users.map(u => {
      if (u.student) {
        return { ...u.student, user: { id: u.id, name: u.name, email: u.email, phone: u.phone, createdAt: u.createdAt } };
      }
      return {
        id: `pending-${u.id}`,
        userId: u.id,
        rollNumber: 'PENDING',
        departmentId: '',
        classId: '',
        semester: 'N/A',
        user: { id: u.id, name: u.name, email: u.email, phone: u.phone, createdAt: u.createdAt },
        department: null,
        class: null,
        isPending: true
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// GET /students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        department: true,
        class: true,
        attendances: { include: { subject: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

// GET /students/me
const getMyProfile = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        department: true,
        class: true,
      },
    });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// PUT /students/:id  (admin only)
const updateStudent = async (req, res) => {
  try {
    const { name, email, phone, rollNumber, departmentId, classId, semester } = req.body;
    const student = await prisma.student.findUnique({ where: { id: req.params.id }, include: { user: true } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    await prisma.user.update({
      where: { id: student.userId },
      data: { name, email, phone },
    });

    const updated = await prisma.student.update({
      where: { id: req.params.id },
      data: { rollNumber, departmentId, classId, semester },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        department: true,
        class: true,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

// DELETE /students/:id (admin only)
const deleteStudent = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    await prisma.user.delete({ where: { id: student.userId } });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

// POST /students/:id/notify - admin sends a direct message/notification to a student
const sendDirectMessage = async (req, res) => {
  try {
    const { message, title } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const notification = await prisma.notification.create({
      data: {
        userId: student.userId,
        type: 'ANNOUNCEMENT',
        title: title || `Message from Admin`,
        message,
        link: '/queries',
      },
    });
    res.status(201).json({ success: true, notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};


// POST /students/:id/grant-edit - admin grants the student one-time permission to edit their profile
const EDIT_ACCESS_TITLE = '__PROFILE_EDIT_ACCESS__';
const grantEditAccess = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Check if permission already granted (unread token exists)
    const existing = await prisma.notification.findFirst({
      where: { userId: student.userId, title: EDIT_ACCESS_TITLE, isRead: false },
    });
    if (existing) {
      return res.status(400).json({ error: 'Edit access already granted and not yet used' });
    }

    // Create the access-token notification
    await prisma.notification.create({
      data: {
        userId: student.userId,
        type: 'GENERAL',
        title: EDIT_ACCESS_TITLE,
        message: 'Administrator has granted you one-time permission to edit your profile. Go to My Profile to make changes.',
        link: '/profile',
      },
    });

    res.json({ success: true, message: `Edit access granted to ${student.user.name}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to grant edit access' });
  }
};

// PUT /students/me - student updates their own profile (one-time, consumes access token)
const updateMyProfile = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: { user: true },
    });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    // Check access token (unread notification with special title)
    const token = await prisma.notification.findFirst({
      where: { userId: req.user.id, title: EDIT_ACCESS_TITLE, isRead: false },
    });
    if (!token) {
      return res.status(403).json({ error: 'You do not have permission to edit your profile. Contact admin.' });
    }

    const { name, phone, rollNumber, departmentId, classId, semester } = req.body;

    // Update user info
    await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone },
    });

    // Update student info
    const updated = await prisma.student.update({
      where: { userId: req.user.id },
      data: { rollNumber, departmentId, classId, semester },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        department: true,
        class: true,
      },
    });

    // Consume the access token (mark as read so it can't be used again)
    await prisma.notification.update({
      where: { id: token.id },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') return res.status(400).json({ error: 'Roll number already exists' });
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = { getStudents, getStudentById, getMyProfile, updateStudent, deleteStudent, sendDirectMessage, grantEditAccess, updateMyProfile };
