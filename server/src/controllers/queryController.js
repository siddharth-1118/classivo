const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /queries - student sends a query to admin/volunteer
const sendQuery = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Query content is required' });
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only students can send queries' });
    }

    // Use type MESSAGE (QUERY not in schema enum) — distinguished by sender role
    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        content,
        type: 'MESSAGE',
      },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });

    // Notify all admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'MESSAGE_REPLY',
          title: `New query from ${req.user.name}`,
          message: content.length > 80 ? content.slice(0, 80) + '...' : content,
          link: '/queries',
        },
      });
    }

    // Also notify volunteers
    const volunteers = await prisma.user.findMany({ where: { role: 'VOLUNTEER' } });
    for (const vol of volunteers) {
      await prisma.notification.create({
        data: {
          userId: vol.id,
          type: 'MESSAGE_REPLY',
          title: `New query from ${req.user.name}`,
          message: content.length > 80 ? content.slice(0, 80) + '...' : content,
          link: '/queries',
        },
      });
    }

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send query' });
  }
};

// GET /queries - fetch messages sent by STUDENT role only (= queries)
const getQueries = async (req, res) => {
  try {
    // Queries = top-level messages sent by STUDENT users
    let where = {
      parentId: null,
      sender: { role: 'STUDENT' },
    };

    // Students see only their own queries
    if (req.user.role === 'STUDENT') {
      where.senderId = req.user.id;
    }

    const queries = await prisma.message.findMany({
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
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
};

// POST /queries/:id/reply - admin/volunteer replies to a query
const replyToQuery = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Reply content is required' });
    if (req.user.role === 'STUDENT') {
      return res.status(403).json({ error: 'Students cannot reply to queries' });
    }

    const parent = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!parent) return res.status(404).json({ error: 'Query not found' });

    const reply = await prisma.message.create({
      data: {
        senderId: req.user.id,
        content,
        type: 'MESSAGE',
        parentId: req.params.id,
      },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });

    // Notify the student who sent the query
    await prisma.notification.create({
      data: {
        userId: parent.senderId,
        type: 'MESSAGE_REPLY',
        title: `${req.user.name} replied to your query`,
        message: content.length > 80 ? content.slice(0, 80) + '...' : content,
        link: '/queries',
      },
    });

    res.status(201).json(reply);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reply to query' });
  }
};

module.exports = { sendQuery, getQueries, replyToQuery };
