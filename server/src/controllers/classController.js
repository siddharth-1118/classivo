const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /classes
const getClasses = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const where = departmentId ? { departmentId } : {};
    const classes = await prisma.class.findMany({
      where,
      include: { department: true },
      orderBy: { name: 'asc' },
    });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

// POST /classes
const createClass = async (req, res) => {
  try {
    const { name, departmentId } = req.body;
    if (!name || !departmentId) return res.status(400).json({ error: 'Name and departmentId required' });
    const cls = await prisma.class.create({
      data: { name, departmentId },
      include: { department: true },
    });
    res.status(201).json(cls);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Class already exists in this department' });
    res.status(500).json({ error: 'Failed to create class' });
  }
};

// PUT /classes/:id
const updateClass = async (req, res) => {
  try {
    const { name, departmentId } = req.body;
    const cls = await prisma.class.update({
      where: { id: req.params.id },
      data: { name, departmentId },
      include: { department: true },
    });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update class' });
  }
};

// DELETE /classes/:id
const deleteClass = async (req, res) => {
  try {
    await prisma.class.delete({ where: { id: req.params.id } });
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete class' });
  }
};

module.exports = { getClasses, createClass, updateClass, deleteClass };
