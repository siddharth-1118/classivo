const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Departments
const getDepartments = async (req, res) => {
  try {
    const depts = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name required' });
    const dept = await prisma.department.create({ data: { name } });
    res.status(201).json(dept);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Department already exists' });
    res.status(500).json({ error: 'Failed to create department' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const dept = await prisma.department.update({ where: { id: req.params.id }, data: { name } });
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update department' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await prisma.department.delete({ where: { id: req.params.id } });
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete department' });
  }
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
