const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /subjects
const getSubjects = async (req, res) => {
  try {
    const { classId, departmentId } = req.query;
    const where = {};
    if (classId) where.classId = classId;
    if (departmentId) where.departmentId = departmentId;
    const subjects = await prisma.subject.findMany({
      where,
      include: { class: true, department: true },
      orderBy: { name: 'asc' },
    });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

// POST /subjects
const createSubject = async (req, res) => {
  try {
    const { name, classId, departmentId } = req.body;
    if (!name || !classId || !departmentId) return res.status(400).json({ error: 'name, classId, departmentId required' });
    const subject = await prisma.subject.create({
      data: { name, classId, departmentId },
      include: { class: true, department: true },
    });
    res.status(201).json(subject);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Subject already exists in this class' });
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

// PUT /subjects/:id
const updateSubject = async (req, res) => {
  try {
    const { name, classId, departmentId } = req.body;
    const subject = await prisma.subject.update({
      where: { id: req.params.id },
      data: { name, classId, departmentId },
      include: { class: true, department: true },
    });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
};

// DELETE /subjects/:id
const deleteSubject = async (req, res) => {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
