const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// POST /announcements (admin only)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content required' });

    const announcement = await prisma.announcement.create({ data: { title, content } });

    // Notify all students and volunteers
    const users = await prisma.user.findMany({ where: { role: { in: ['STUDENT', 'VOLUNTEER'] } } });
    if (users.length > 0) {
      await prisma.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          type: 'ANNOUNCEMENT',
          title: `Announcement: ${title}`,
          message: content.length > 100 ? content.slice(0, 100) + '...' : content,
          link: '/notifications',
        })),
      });
    }

    res.status(201).json(announcement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

// PUT /announcements/:id (admin only)
const updateAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    const announcement = await prisma.announcement.update({
      where: { id: req.params.id },
      data: { title, content },
    });
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

// DELETE /announcements/:id (admin only)
const deleteAnnouncement = async (req, res) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
