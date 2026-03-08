const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      console.log(`[DEBUG] Auth Failed: User ${decoded.userId} not found`);
      return res.status(401).json({ error: 'User not found' });
    }
    console.log(`[DEBUG] Authenticated: ${user.email} (${user.role})`);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      console.log(`[DEBUG] Authorization Denied: User role ${req.user.role} not in [${roles}] for ${req.originalUrl}`);
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
