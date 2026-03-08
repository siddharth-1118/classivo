'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { AdminStats, Announcement } from '@/lib/types';
import { Users, FolderOpen, MessageSquare, BarChart3, Bell, Plus, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace(user.role === 'VOLUNTEER' ? '/volunteer/dashboard' : '/dashboard');
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [statsRes, annRes] = await Promise.allSettled([api.get('/admin/stats'), api.get('/announcements')]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (annRes.status === 'fulfilled') setAnnouncements(annRes.value.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/announcements', { title: annTitle, content: annContent });
      toast.success('Announcement sent to all students!');
      setShowForm(false); setAnnTitle(''); setAnnContent('');
      fetchData();
    } catch { toast.error('Failed to create announcement'); } finally { setSubmitting(false); }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try { await api.delete(`/announcements/${id}`); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  const statCards = stats ? [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'var(--blue)', bg: 'rgba(137,180,250,0.15)' },
    { label: 'Active Volunteers', value: stats.activeVolunteers, icon: Users, color: 'var(--green)', bg: 'rgba(166,227,161,0.15)' },
    { label: 'Files Uploaded', value: stats.totalFiles, icon: FolderOpen, color: 'var(--purple)', bg: 'rgba(203,166,247,0.15)' },
    { label: 'Pending Profiles', value: stats.pendingProfilesCount, icon: Bell, color: 'var(--peach)', bg: 'rgba(250,179,135,0.15)' },
    { label: 'Messages (Unread)', value: `${stats.unreadMessages}/${stats.totalMessages}`, icon: MessageSquare, color: 'var(--yellow)', bg: 'rgba(249,226,175,0.15)' },
    { label: 'Avg Attendance', value: stats.avgAttendance != null ? `${stats.avgAttendance}%` : 'N/A', icon: BarChart3, color: 'var(--teal)', bg: 'rgba(148,226,213,0.15)' },
    { label: 'Low Attendance', value: stats.lowAttendanceCount, icon: Bell, color: 'var(--red)', bg: 'rgba(243,139,168,0.15)' },
  ] : [];

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Platform overview and management">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" style={{ width: '32px', height: '32px' }} /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Stats grid */}
          <div className="stats-grid">
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="stat-card">
                <div className="stat-icon" style={{ background: bg }}><Icon size={20} color={color} /></div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
            {/* Quick nav */}
            <div className="card">
              <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '14px' }}>Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Manage Students', href: '/admin/students', color: 'var(--blue)' },
                  { label: 'Manage Volunteers', href: '/admin/volunteers', color: 'var(--green)' },
                  { label: 'Departments', href: '/admin/departments', color: 'var(--purple)' },
                  { label: 'Classes', href: '/admin/classes', color: 'var(--peach)' },
                  { label: 'Subjects', href: '/admin/subjects', color: 'var(--teal)' },
                  { label: 'Files', href: '/admin/files', color: 'var(--yellow)' },
                  { label: 'Messages', href: '/admin/messages', color: 'var(--red)' },
                  { label: 'Analytics', href: '/admin/analytics', color: 'var(--blue)' },
                ].map(({ label, href, color }) => (
                  <a key={href} href={href} style={{ padding: '12px', background: 'var(--bg-overlay)', borderRadius: '8px', border: '1px solid var(--border-subtle)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', transition: 'all 0.15s' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />{label}
                  </a>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '600' }}>Announcements</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}><Plus size={14} /> New</button>
              </div>

              {showForm && (
                <form onSubmit={createAnnouncement} style={{ marginBottom: '16px', padding: '14px', background: 'var(--bg-overlay)', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input className="input" placeholder="Announcement title..." value={annTitle} onChange={e => setAnnTitle(e.target.value)} required />
                  <textarea className="input" rows={3} placeholder="Announcement content..." value={annContent} onChange={e => setAnnContent(e.target.value)} required />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Sending...' : 'Send to all'}</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                  </div>
                </form>
              )}

              {announcements.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px' }}>
                  <Bell size={28} style={{ opacity: 0.3 }} />
                  <div className="empty-state-title">No announcements</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                  {announcements.map(a => (
                    <div key={a.id} style={{ padding: '12px', background: 'var(--bg-overlay)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{a.title}</div>
                        <button onClick={() => deleteAnnouncement(a.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', padding: '2px' }}><Trash2 size={12} /></button>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{a.content}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
