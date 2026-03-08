const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, activeVolunteers, totalFiles, totalMessages, totalAnnouncements] = await Promise.all([
      prisma.student.count(),
      prisma.volunteer.count(),
      prisma.file.count(),
      prisma.message.count({ where: { parentId: null } }),
      prisma.announcement.count(),
    ]);

    const unreadMessages = await prisma.message.count({ where: { parentId: null, isRead: false } });

    // Attendance stats
    const attendanceRecords = await prisma.attendanceRecord.findMany({ where: { uploadType: 'MANUAL' } });
    const avgAttendance = attendanceRecords.length > 0
      ? attendanceRecords.reduce((a, r) => a + r.percentage, 0) / attendanceRecords.length
      : null;

    const lowAttendanceCount = attendanceRecords.filter((r) => r.percentage < 75).length;

    res.json({
      totalStudents,
      activeVolunteers,
      totalFiles,
      totalMessages,
      unreadMessages,
      totalAnnouncements,
      avgAttendance: avgAttendance ? parseFloat(avgAttendance.toFixed(1)) : null,
      lowAttendanceCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// GET /admin/analytics/attendance
const getAttendanceAnalytics = async (req, res) => {
  try {
    const { classId, departmentId } = req.query;

    // Get all manual attendance records grouped
    const records = await prisma.attendanceRecord.findMany({
      where: { uploadType: 'MANUAL' },
      include: {
        student: {
          include: {
            class: true,
            department: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    // Filter
    let filtered = records;
    if (classId) filtered = filtered.filter((r) => r.student.classId === classId);
    if (departmentId) filtered = filtered.filter((r) => r.student.departmentId === departmentId);

    // By subject
    const bySubject = {};
    for (const r of filtered) {
      const key = r.subjectName || 'Unknown';
      if (!bySubject[key]) bySubject[key] = { subject: key, records: [], avg: 0 };
      bySubject[key].records.push(r.percentage);
    }

    for (const key in bySubject) {
      const arr = bySubject[key].records;
      bySubject[key].avg = parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));
      bySubject[key].count = arr.length;
      bySubject[key].low = arr.filter((p) => p < 75).length;
      delete bySubject[key].records;
    }

    // By class
    const byClass = {};
    for (const r of filtered) {
      const key = r.student.class?.name || 'Unknown';
      if (!byClass[key]) byClass[key] = { className: key, records: [] };
      byClass[key].records.push(r.percentage);
    }
    for (const key in byClass) {
      const arr = byClass[key].records;
      byClass[key].avg = parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));
      byClass[key].count = arr.length;
      delete byClass[key].records;
    }

    res.json({ bySubject: Object.values(bySubject), byClass: Object.values(byClass), total: filtered.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// GET /admin/analytics/files
const getFileAnalytics = async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      include: { class: true, department: true, _count: { select: { downloads: true } } },
    });

    const byCategory = {};
    const byClass = {};
    for (const f of files) {
      byCategory[f.category] = (byCategory[f.category] || 0) + 1;
      const key = f.class?.name || 'Unknown';
      byClass[key] = (byClass[key] || 0) + 1;
    }

    res.json({
      totalFiles: files.length,
      byCategory,
      byClass,
      topDownloaded: files
        .sort((a, b) => b._count.downloads - a._count.downloads)
        .slice(0, 5)
        .map((f) => ({ id: f.id, title: f.title, downloads: f._count.downloads })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch file analytics' });
  }
};

module.exports = { getDashboardStats, getAttendanceAnalytics, getFileAnalytics };
