export type Role = 'ADMIN' | 'STUDENT' | 'VOLUNTEER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  profile?: StudentProfile | VolunteerProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  rollNumber: string;
  semester: string;
  departmentId: string;
  classId: string;
  department?: Department;
  class?: Class;
}

export interface VolunteerProfile {
  id: string;
  userId: string;
  departmentId: string;
  classId: string;
  department?: Department;
  class?: Class;
}

export interface Department {
  id: string;
  name: string;
}

export interface Class {
  id: string;
  name: string;
  departmentId: string;
  department?: Department;
}

export interface Subject {
  id: string;
  name: string;
  classId: string;
  departmentId: string;
  class?: Class;
  department?: Department;
}

export interface FileItem {
  id: string;
  title: string;
  description?: string;
  subjectName: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  fileType: 'PDF' | 'DOC' | 'DOCX' | 'IMAGE' | 'OTHER';
  category: 'QUESTION_PAPER' | 'NOTES' | 'ASSIGNMENT' | 'STUDY_MATERIAL';
  departmentId: string;
  classId: string;
  uploadedById: string;
  createdAt: string;
  department?: Department;
  class?: Class;
  uploader?: { user: { name: string } };
  _count?: { downloads: number };
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectName?: string;
  percentage: number;
  uploadType: 'SCREENSHOT' | 'PDF' | 'MANUAL';
  fileUrl?: string;
  semester?: string;
  createdAt: string;
}

export interface AttendanceSummary {
  subjectName: string;
  percentage: number;
  records: AttendanceRecord[];
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'MESSAGE' | 'EMERGENCY_ALERT';
  isRead: boolean;
  parentId?: string;
  createdAt: string;
  sender: { id: string; name: string; role: Role; email?: string };
  replies?: Message[];
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface AdminStats {
  totalStudents: number;
  activeVolunteers: number;
  totalFiles: number;
  totalMessages: number;
  unreadMessages: number;
  totalAnnouncements: number;
  avgAttendance: number | null;
  lowAttendanceCount: number;
  pendingProfilesCount: number;
}
