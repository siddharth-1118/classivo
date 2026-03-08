const prisma = require('../services/db');

const getStudentStats = async (req, res) => {
  const studentId = req.user.id;

  try {
    const student = await prisma.student.findUnique({
      where: { userId: studentId },
      include: { class: true }
    });

    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId }
    });

    const totalAttendance = attendanceRecords.length > 0 
      ? (attendanceRecords.reduce((acc, curr) => acc + curr.percentage, 0) / attendanceRecords.length).toFixed(1) + '%'
      : '0%';

    const resourcesCount = await prisma.file.count({
      where: { classId: student?.classId || 0 }
    });

    const messagesCount = await prisma.message.count({
      where: { receiverId: studentId, status: 'unread' }
    });

    res.json({
      overallAttendance: totalAttendance,
      classesToday: '4', // This would ideally come from a real schedule table
      pendingTasks: '0',
      resourcesCount,
      unreadMessages: messagesCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to aggregate dashboard stats' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const studentCount = await prisma.student.count();
    const volunteerCount = await prisma.user.count({ where: { role: 'VOLUNTEER' } });
    const fileCount = await prisma.file.count();
    const notificationCount = await prisma.message.count({ where: { type: 'ANNOUNCEMENT' } });
    
    res.json({
      totalStudents: studentCount,
      activeVolunteers: volunteerCount,
      filesUploaded: fileCount,
      announcementsCount: notificationCount,
      attendanceAverage: '78%' // Placeholder for complex aggregation
    });
  } catch (error) {
    res.status(500).json({ error: 'Stats unavailable' });
  }
};

const getVolunteerStats = async (req, res) => {
  const volunteerId = req.user.id;
  try {
    // Get class managed by this volunteer
    const volunteer = await prisma.user.findUnique({
      where: { id: volunteerId },
      include: { volunteerProfile: true }
    });

    const classId = volunteer?.volunteerProfile?.classId;
    const studentCount = classId ? await prisma.student.count({ where: { classId } }) : 0;
    const myFilesCount = await prisma.file.count({ where: { uploaderId: volunteerId } });
    
    res.json({
      managedStudents: studentCount,
      myUploads: myFilesCount,
      classLabel: volunteer?.volunteerProfile?.className || 'Assigned Class',
      notificationsCount: 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Volunteer stats fetch failed' });
  }
};

module.exports = { getStudentStats, getAdminStats, getVolunteerStats };
