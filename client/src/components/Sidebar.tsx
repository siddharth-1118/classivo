'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, LayoutDashboard, ClipboardCheck, FolderOpen, MessageSquare, Bell, User, Users, BookOpen, Building2, School, BarChart3, LogOut, Upload, AlertTriangle, HelpCircle } from 'lucide-react';

const studentNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { href: '/files', label: 'Study Materials', icon: FolderOpen },
  { href: '/queries', label: 'My Queries', icon: HelpCircle },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'My Profile', icon: User },
];

const volunteerNav = [
  { href: '/volunteer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/volunteer/upload', label: 'Upload Files', icon: Upload },
  { href: '/queries', label: 'Student Queries', icon: HelpCircle },
  { href: '/volunteer/messages', label: 'Messages', icon: MessageSquare },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/volunteers', label: 'Volunteers', icon: BookOpen },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/classes', label: 'Classes', icon: School },
  { href: '/admin/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/admin/files', label: 'Files', icon: FolderOpen },
  { href: '/admin/upload', label: 'Upload Materials', icon: Upload },
  { href: '/queries', label: 'Student Queries', icon: HelpCircle },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = user.role === 'ADMIN' ? adminNav : user.role === 'VOLUNTEER' ? volunteerNav : studentNav;
  const roleLabel = user.role === 'ADMIN' ? 'Administrator' : user.role === 'VOLUNTEER' ? 'Class Volunteer' : 'Student';
  const roleColor = user.role === 'ADMIN' ? 'var(--purple)' : user.role === 'VOLUNTEER' ? 'var(--peach)' : 'var(--blue)';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', background: 'var(--accent)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <GraduationCap size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '16px' }}>Classivo</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Management Platform</div>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--accent-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid var(--border)' }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--accent)' }}>{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div style={{ fontSize: '11px', color: roleColor, fontWeight: '500' }}>{roleLabel}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {user.role === 'VOLUNTEER' && (
          <div style={{ padding: '6px 8px 4px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Emergency</div>
        )}
        {user.role === 'VOLUNTEER' && (
          <Link href="/volunteer/alert" className={`nav-item ${pathname === '/volunteer/alert' ? 'active' : ''}`} style={{ color: pathname === '/volunteer/alert' ? undefined : 'var(--red)' }}>
            <AlertTriangle size={16} />
            Emergency Alert
          </Link>
        )}
        {user.role === 'VOLUNTEER' && <div className="divider" />}

        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`nav-item ${pathname === href || (href !== '/admin' && href !== '/dashboard' && href !== '/volunteer/dashboard' && pathname.startsWith(href)) ? 'active' : ''}`}>
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <button onClick={logout} className="nav-item" style={{ color: 'var(--red)', width: '100%' }}>
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
