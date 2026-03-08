const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ATTENDANCE_WARNING_THRESHOLD = 75;

// POST /attendance  - upload attendance (student only)
const uploadAttendance = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(403).json({ error: 'Student profile not found' });

    const { uploadType, subjects, semester } = req.body;
    if (!uploadType) return res.status(400).json({ error: 'uploadType is required' });

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const created = [];

    if (uploadType === 'MANUAL' && subjects) {
      // subjects is a JSON array: [{subjectName, percentage, subjectId?}]
      const subjectData = typeof subjects === 'string' ? JSON.parse(subjects) : subjects;

      for (const sub of subjectData) {
        const record = await prisma.attendanceRecord.create({
          data: {
            studentId: student.id,
            subjectName: sub.subjectName,
            subjectId: sub.subjectId || null,
            percentage: parseFloat(sub.percentage),
            uploadType: 'MANUAL',
            semester: semester || student.semester,
            manualData: sub,
          },
        });
        created.push(record);

        // Warn if below threshold
        if (parseFloat(sub.percentage) < ATTENDANCE_WARNING_THRESHOLD) {
          await prisma.notification.create({
            data: {
              userId: req.user.id,
              type: 'ATTENDANCE_WARNING',
              title: 'Low Attendance Warning',
              message: `Your attendance in "${sub.subjectName}" is ${sub.percentage}%, which is below the ${ATTENDANCE_WARNING_THRESHOLD}% threshold.`,
              link: '/attendance',
            },
          });
        }
      }
    } else {
      // File-based upload (SCREENSHOT or PDF)
      if (!fileUrl) return res.status(400).json({ error: 'File is required for this upload type' });
      const record = await prisma.attendanceRecord.create({
        data: {
          studentId: student.id,
          percentage: 0, // Will be computed manually or extracted later
          uploadType,
          fileUrl,
          semester: semester || student.semester,
        },
      });
      created.push(record);
    }

    res.status(201).json({ message: 'Attendance uploaded', records: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload attendance' });
  }
};

// GET /attendance/me  - get my attendance
const getMyAttendance = async (req, res) => {
  console.log(`[DEBUG] getMyAttendance hit for user ${req.user.id}`);
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) {
      console.log(`[DEBUG] No student profile for user ${req.user.id}`);
      return res.json({ records: [], summary: [], overallAvg: null, threshold: ATTENDANCE_WARNING_THRESHOLD });
    }

    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: student.id },
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate by subjectName - take the latest percentage per subject
    const subjectMap = {};
    for (const r of records) {
      const key = r.subjectName || r.subject?.name || 'Unknown';
      if (!subjectMap[key]) {
        subjectMap[key] = { subjectName: key, percentage: r.percentage, records: [] };
      }
      subjectMap[key].records.push(r);
    }

    const summary = Object.values(subjectMap);
    const overallAvg = summary.length > 0
      ? summary.reduce((acc, s) => acc + s.percentage, 0) / summary.length
      : null;

    res.json({ records, summary, overallAvg, threshold: ATTENDANCE_WARNING_THRESHOLD });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

// GET /attendance/:studentId (admin)
const getStudentAttendance = async (req, res) => {
  try {
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: req.params.studentId },
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

// GET /attendance/class/:classId  (admin analytics)
const getClassAttendance = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: { classId: req.params.classId },
      include: {
        user: { select: { name: true } },
        attendances: true,
      },
    });

    const result = students.map((s) => {
      const avg = s.attendances.length > 0
        ? s.attendances.reduce((a, r) => a + r.percentage, 0) / s.attendances.length
        : null;
      return { studentId: s.id, name: s.user.name, rollNumber: s.rollNumber, averageAttendance: avg };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch class attendance' });
  }
};

module.exports = { uploadAttendance, getMyAttendance, getStudentAttendance, getClassAttendance };
