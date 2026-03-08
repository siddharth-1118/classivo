"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navItemsByRole: Record<string, any[]> = {
  ADMIN: [
    { name: 'Analytics', icon: '📈', href: '/dashboard/admin/analytics' },
    { name: 'Students', icon: '👨‍🎓', href: '/dashboard/admin/students' },
    { name: 'Volunteers', icon: '🤝', href: '/dashboard/admin/volunteers' },
    { name: 'Files', icon: '📂', href: '/dashboard/admin/files' },
    { name: 'Departments', icon: '🏢', href: '/dashboard/admin/departments' },
    { name: 'Classes', icon: '🏫', href: '/dashboard/admin/classes' },
    { name: 'Subjects', icon: '📚', href: '/dashboard/admin/subjects' },
  ],
  STUDENT: [
    { name: 'Dashboard', icon: '🏠', href: '/dashboard' },
    { name: 'Attendance', icon: '📊', href: '/dashboard/attendance' },
    { name: 'Files', icon: '📂', href: '/dashboard/files' },
    { name: 'Messages', icon: '💬', href: '/dashboard/messages' },
    { name: 'Notifications', icon: '🔔', href: '/dashboard/notifications' },
    { name: 'Profile', icon: '👤', href: '/dashboard/profile' },
  ],
  VOLUNTEER: [
    { name: 'Dashboard', icon: '🏠', href: '/dashboard' },
    { name: 'Upload Files', icon: '📤', href: '/dashboard/files/upload' },
    { name: 'Messages', icon: '💬', href: '/dashboard/messages' },
    { name: 'Notifications', icon: '🔔', href: '/dashboard/notifications' },
    { name: 'Emergency', icon: '🚨', href: '/dashboard/emergency' },
    { name: 'Profile', icon: '👤', href: '/dashboard/profile' },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch for client-only dynamic content

  const navItems = user && user.role ? navItemsByRole[user.role] : navItemsByRole.STUDENT;

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 shadow-sm">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-100">🎓</div>
        <span className="text-xl font-black text-slate-900 tracking-tighter">CLASSIVO</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item: any) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${
                isActive 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
          <div className="w-10 h-10 bg-blue-100 rounded-xl border-2 border-white overflow-hidden">
            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=2563EB&color=fff`} alt="avatar" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Loading...'}</p>
            <p className="text-xs font-semibold text-slate-400 capitalize">{user?.role?.toLowerCase() || '...'}</p>
          </div>
          <button 
            suppressHydrationWarning
            onClick={() => {
               logout();
            }}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
}
