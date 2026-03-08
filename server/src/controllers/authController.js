const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const findOrCreateDeptAndClass = async (deptName, className) => {
  let department = await prisma.department.findUnique({
    where: { name: deptName },
  });

  if (!department) {
    department = await prisma.department.create({
      data: { name: deptName },
    });
  }

  let classRecord = await prisma.class.findFirst({
    where: { 
      name: className,
      departmentId: department.id
    },
  });

  if (!classRecord) {
    classRecord = await prisma.class.create({
      data: { 
        name: className,
        departmentId: department.id
      },
    });
  }

  return { departmentId: department.id, classId: classRecord.id };
};

// POST /auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, rollNumber, departmentName, className, semester } = req.body;

    if (!name || !email || !password || !rollNumber || !departmentName || !className || !semester) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const existingRoll = await prisma.student.findUnique({ where: { rollNumber } });
    if (existingRoll) return res.status(400).json({ error: 'Roll number already exists' });

    const { departmentId, classId } = await findOrCreateDeptAndClass(departmentName, className);

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role: 'STUDENT',
        student: {
          create: { rollNumber, departmentId, classId, semester },
        },
      },
      include: { student: true },
    });

    const token = generateToken(user.id);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, student: user.student },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// POST /auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id);
    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await prisma.student.findUnique({
        where: { userId: user.id },
        include: { department: true, class: true },
      });
    } else if (user.role === 'VOLUNTEER') {
      profile = await prisma.volunteer.findUnique({
        where: { userId: user.id },
        include: { department: true, class: true },
      });
    }

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, profile },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// GET /auth/me
const me = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await prisma.student.findUnique({
        where: { userId: user.id },
        include: { department: true, class: true },
      });
    } else if (user.role === 'VOLUNTEER') {
      profile = await prisma.volunteer.findUnique({
        where: { userId: user.id },
        include: { department: true, class: true },
      });
    }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// POST /auth/google
const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    if (!tokenId) return res.status(400).json({ error: 'Token ID required' });

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: { include: { department: true, class: true } },
        volunteer: { include: { department: true, class: true } }
      }
    });

    if (!user) {
      // Create a basic user if they don't exist
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: await bcrypt.hash(Math.random().toString(36), 12),
          role: 'STUDENT',
        },
        include: {
          student: { include: { department: true, class: true } },
          volunteer: { include: { department: true, class: true } }
        }
      });
    }

    const token = generateToken(user.id);
    const profile = user.role === 'STUDENT' ? user.student : user.volunteer;

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, profile },
    });
  } catch (err) {
    console.error('Google login error detail:', err);
    if (err.name === 'PrismaClientKnownRequestError' || err.message.includes('Can\'t reach database')) {
      return res.status(503).json({ error: 'Database connection failed. Please try again later.' });
    }
    res.status(401).json({ error: 'Invalid Google token' });
  }
};

// POST /auth/complete-profile
const completeProfile = async (req, res) => {
  try {
    const { role, rollNumber, departmentName, className, semester } = req.body;
    const userId = req.user.id;

    if (!role || !departmentName || !className) {
      return res.status(400).json({ error: 'Role, department, and class are required' });
    }

    if (role === 'STUDENT' && (!rollNumber || !semester)) {
      return res.status(400).json({ error: 'Roll number and semester are required for students' });
    }

    const { departmentId, classId } = await findOrCreateDeptAndClass(departmentName, className);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    let profile;
    if (role === 'STUDENT') {
      profile = await prisma.student.create({
        data: { userId, rollNumber, departmentId, classId, semester },
        include: { department: true, class: true },
      });
    } else if (role === 'VOLUNTEER') {
      profile = await prisma.volunteer.create({
        data: { userId, departmentId, classId },
        include: { department: true, class: true },
      });
    }

    res.json({
      message: 'Profile completed successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, profile },
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Roll number already exists or profile already created' });
    }
    res.status(500).json({ error: 'Failed to complete profile' });
  }
};

module.exports = { register, login, googleLogin, me, completeProfile };
