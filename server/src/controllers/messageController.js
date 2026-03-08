const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /messages - send message to admin
const sendMessage = async (req, res) => {
  try {
    const { content, type, parentId } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        content,
        type: type || 'MESSAGE',
        parentId: parentId || null,
      },
      include: { sender: { select: { id: true, name: true, role: true } }, parent: true },
    });

    // If it's a reply from admin, notify the original sender
    if (parentId) {
      const parent = await prisma.message.findUnique({ where: { id: parentId } });
      if (parent && parent.senderId !== req.user.id) {
        await prisma.notification.create({
          data: {
            userId: parent.senderId,
            type: 'MESSAGE_REPLY',
            title: 'Admin replied to your message',
            message: content.length > 80 ? content.slice(0, 80) + '...' : content,
            link: '/messages',
          },
        });
      }
    }

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// GET /messages - get messages (admin sees all; others see their own)
const getMessages = async (req, res) => {
  try {
    let where = { parentId: null }; // Only top-level messages

    if (req.user.role !== 'ADMIN') {
      where.senderId = req.user.id;
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, role: true, email: true } },
        replies: {
          include: { sender: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// GET /messages/:id - get a message thread
const getMessageThread = async (req, res) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: req.params.id },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        replies: {
          include: { sender: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch message thread' });
  }
};

// PUT /messages/:id/read (mark as read)
const markRead = async (req, res) => {
  try {
    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

// DELETE /messages/:id (admin only)
const deleteMessage = async (req, res) => {
  try {
    await prisma.message.delete({ where: { id: req.params.id } });
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

module.exports = { sendMessage, getMessages, getMessageThread, markRead, deleteMessage };
