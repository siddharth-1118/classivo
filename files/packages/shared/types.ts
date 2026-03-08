export type UserRole = 'ADMIN' | 'STUDENT' | 'VOLUNTEER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  volunteerId?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  departmentId: string;
  semester: number;
  classId: string;
  phone: string;
  email: string;
}

export interface Volunteer {
  id: string;
  name: string;
  classId: string;
  departmentId: string;
  email: string;
  active: boolean;
}

export interface Department {
  id: string;
  name: string;
}

export interface Class {
  id: string;
  name: string;
  departmentId: string;
}

export interface Subject {
  id: string;
  name: string;
  departmentId: string;
  classId: string;
}

export interface File {
  id: string;
  title: string;
  description: string;
  category: string;
  filename: string;
  url: string;
  departmentId: string;
  classId: string;
  subjectId: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  subjectId: string;
  type: string;
  value: number;
  fileUrl?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  replyTo?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}