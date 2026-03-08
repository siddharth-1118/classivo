import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const linksByRole = {
  ADMIN: [
    { href: '/admin/students', label: 'Students' },
    { href: '/admin/volunteers', label: 'Volunteers' },
    { href: '/admin/files', label: 'Files' },
    { href: '/admin/departments', label: 'Departments' },
    { href: '/admin/classes', label: 'Classes' },
    { href: '/admin/subjects', label: 'Subjects' },
    { href: '/admin/analytics', label: 'Analytics' },
  ],
  STUDENT: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/attendance', label: 'Attendance' },
    { href: '/files', label: 'Files' },
    { href: '/messages', label: 'Messages' },
    { href: '/notifications', label: 'Notifications' },
    { href: '/profile', label: 'Profile' },
  ],
  VOLUNTEER: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/files/upload', label: 'Upload Materials' },
    { href: '/messages', label: 'Messages' },
    { href: '/notifications', label: 'Notifications' },
    { href: '/emergency', label: 'Emergency Alerts' },
    { href: '/profile', label: 'Profile' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const links = linksByRole[user.role] || [];
  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col h-full">
      <div className="p-4 font-bold text-lg">Classivo</div>
      <nav className="flex-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block px-4 py-2 hover:bg-gray-700">
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}