const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /volunteers
const getVolunteers = async (req, res) => {
  try {
    const { departmentId, classId } = req.query;
    const where = {};
    if (departmentId) where.departmentId = departmentId;
    if (classId) where.classId = classId;
    const volunteers = await prisma.volunteer.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        department: true,
        class: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
};

// GET /volunteers/me
const getMyProfile = async (req, res) => {
  try {
    const volunteer = await prisma.volunteer.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        department: true,
        class: true,
      },
    });
    if (!volunteer) return res.status(404).json({ error: 'Volunteer profile not found' });
    res.json(volunteer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch volunteer profile' });
  }
};

// POST /volunteers/assign  (admin only) - make a user a volunteer
const assignVolunteer = async (req, res) => {
  try {
    const { userId, departmentId, classId } = req.body;
    if (!userId || !departmentId || !classId) {
      return res.status(400).json({ error: 'userId, departmentId, and classId are required' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if already a volunteer
    const existing = await prisma.volunteer.findUnique({ where: { userId } });
    if (existing) {
      const updated = await prisma.volunteer.update({
        where: { userId },
        data: { departmentId, classId },
        include: { user: { select: { id: true, name: true, email: true } }, department: true, class: true },
      });
      return res.json(updated);
    }

    // Update user role to VOLUNTEER
    await prisma.user.update({ where: { id: userId }, data: { role: 'VOLUNTEER' } });

    const volunteer = await prisma.volunteer.create({
      data: { userId, departmentId, classId },
      include: { user: { select: { id: true, name: true, email: true } }, department: true, class: true },
    });
    res.status(201).json(volunteer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign volunteer' });
  }
};

// DELETE /volunteers/:id (admin only)
const removeVolunteer = async (req, res) => {
  try {
    const volunteer = await prisma.volunteer.findUnique({ where: { id: req.params.id } });
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
    // Revert role to student if they are a student
    const student = await prisma.student.findUnique({ where: { userId: volunteer.userId } });
    await prisma.user.update({
      where: { id: volunteer.userId },
      data: { role: student ? 'STUDENT' : 'STUDENT' },
    });
    await prisma.volunteer.delete({ where: { id: req.params.id } });
    res.json({ message: 'Volunteer removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove volunteer' });
  }
};

module.exports = { getVolunteers, getMyProfile, assignVolunteer, removeVolunteer };
