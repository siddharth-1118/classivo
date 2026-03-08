const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// PUT /notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// PUT /notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

// POST /notifications (admin-only, create announcement notification for all)
const createBroadcastNotification = async (req, res) => {
  try {
    const { title, message, targetClassId, targetDepartmentId } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'title and message required' });

    const where = { role: { in: ['STUDENT', 'VOLUNTEER'] } };
    const users = await prisma.user.findMany({ where });

    const data = users.map((u) => ({
      userId: u.id,
      type: 'ANNOUNCEMENT',
      title,
      message,
      link: '/notifications',
    }));

    await prisma.notification.createMany({ data });
    res.json({ message: `Notification sent to ${data.length} users` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notifications' });
  }
};

module.exports = { getNotifications, markNotificationRead, markAllRead, createBroadcastNotification };
