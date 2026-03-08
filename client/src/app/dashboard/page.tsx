'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import type { Announcement, FileItem, Notification, AttendanceSummary } from '@/lib/types';
import { BookOpen, Bell, ClipboardCheck, FolderOpen, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import AttendanceChart from '@/components/AttendanceChart';
import EmptyState from '@/components/EmptyState';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [attendance, setAttendance] = useState<{ summary: AttendanceSummary[]; overallAvg: number | null }>({ summary: [], overallAvg: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      if (!user?.profile && user?.role !== 'ADMIN') {
        console.log('[DEBUG] No profile yet, skipping dashboard fetches');
        return;
      }
      try {
        const [ann, filesRes, notifsRes, attRes] = await Promise.allSettled([
          api.get('/announcements'),
          api.get('/files'),
          api.get('/notifications'),
          api.get('/attendance/me'),
        ]);
        if (ann.status === 'fulfilled') setAnnouncements(ann.value.data.slice(0, 3));
        if (filesRes.status === 'fulfilled') setFiles(filesRes.value.data.slice(0, 4));
        if (notifsRes.status === 'fulfilled') {
          const data = notifsRes.value.data;
          setNotifications(Array.isArray(data) ? data.slice(0, 5) : (data.notifications || []).slice(0, 5));
        }
        if (attRes.status === 'fulfilled') setAttendance({ summary: attRes.value.data.summary, overallAvg: attRes.value.data.overallAvg });
      } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const catColor: Record<string, string> = { QUESTION_PAPER: 'badge-yellow', NOTES: 'badge-blue', ASSIGNMENT: 'badge-peach', STUDY_MATERIAL: 'badge-green' };
  const catLabel: Record<string, string> = { QUESTION_PAPER: 'Question Paper', NOTES: 'Notes', ASSIGNMENT: 'Assignment', STUDY_MATERIAL: 'Study Material' };

  const lowAttendance = attendance.summary.filter(s => s.percentage < 75);

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.name}!`}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner" style={{ width: '40px', height: '40px' }} /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {lowAttendance.length > 0 && (
            <div className="alert alert-danger" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <AlertTriangle size={20} />
              <div>
                <strong>Low Attendance Warning:</strong> Your attendance in{' '}
                <span style={{ fontWeight: '700' }}>{lowAttendance.map(s => s.subjectName).join(', ')}</span> is below 75%.
              </div>
            </div>
          )}

          <div className="stats-grid">
            <StatCard 
              title="Overall Attendance" 
              value={attendance.overallAvg != null ? `${attendance.overallAvg.toFixed(1)}%` : 'N/A'} 
              icon={ClipboardCheck} 
              color="var(--blue)" 
              description="Average across all subjects"
              trend={attendance.overallAvg ? { value: 2.5, isUp: true } : undefined}
            />
            <StatCard 
              title="Study Materials" 
              value={files.length} 
              icon={FolderOpen} 
              color="var(--green)" 
              description="Resources available"
            />
            <StatCard 
              title="Unread Messages" 
              value={notifications.filter(n => !n.isRead).length} 
              icon={Bell} 
              color="var(--purple)" 
              description="New notifications"
            />
            <StatCard 
              title="Latest Announcements" 
              value={announcements.length} 
              icon={BookOpen} 
              color="var(--yellow)" 
              description="From college admin"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '0' }}>
                <div style={{ padding: '20px 20px 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>Attendance Analysis</h3>
                </div>
                <AttendanceChart 
                  labels={attendance.summary.map(s => s.subjectName)} 
                  data={attendance.summary.map(s => s.percentage)} 
                  color="var(--accent)"
                />
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>Latest Study Materials</h3>
                  <Link href="/files" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>View all Resources</Link>
                </div>
                {files.length === 0 ? (
                  <EmptyState title="No materials found" description="Resource uploads from volunteers will appear here." icon={FolderOpen} />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {files.map(f => (
                      <div key={f.id} className="resource-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{f.subjectName}</div>
                        <div style={{ marginTop: '8px' }}>
                          <span className={`badge ${catColor[f.category] || 'badge-blue'}`}>{catLabel[f.category] || f.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>Recent Announcements</h3>
                </div>
                {announcements.length === 0 ? (
                  <EmptyState title="Quiet for now" description="Stay tuned for updates from administration." icon={BookOpen} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {announcements.map(a => (
                      <div key={a.id} style={{ padding: '16px', background: 'rgba(var(--accent-rgb), 0.03)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '600' }}>{a.title}</h4>
                        <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.content}</p>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

