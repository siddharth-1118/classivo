'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import type { Notification } from '@/lib/types';
import { Bell, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const typeColor: Record<string, string> = {
  FILE_UPLOAD: 'var(--blue)', ANNOUNCEMENT: 'var(--purple)', ATTENDANCE_WARNING: 'var(--red)',
  MESSAGE_REPLY: 'var(--green)', EMERGENCY_ALERT: 'var(--yellow)', GENERAL: 'var(--text-muted)',
};
const typeBadge: Record<string, string> = {
  FILE_UPLOAD: 'badge-blue', ANNOUNCEMENT: 'badge-purple', ATTENDANCE_WARNING: 'badge-red',
  MESSAGE_REPLY: 'badge-green', EMERGENCY_ALERT: 'badge-yellow', GENERAL: 'badge-teal',
};
const typeLabel: Record<string, string> = {
  FILE_UPLOAD: 'New File', ANNOUNCEMENT: 'Announcement', ATTENDANCE_WARNING: 'Attendance Warning',
  MESSAGE_REPLY: 'Admin Reply', EMERGENCY_ALERT: 'Emergency Alert', GENERAL: 'General',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markOne = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
    } catch {}
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark as read'); } finally { setMarkingAll(false); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}>
      <div style={{ maxWidth: '720px' }}>
        {/* Header actions */}
        {unreadCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button className="btn btn-secondary" onClick={markAll} disabled={markingAll}>
              {markingAll ? <div className="spinner" /> : <CheckCheck size={16} />}
              Mark all as read
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" style={{ width: '32px', height: '32px' }} /></div>
        ) : notifications.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Bell size={48} style={{ opacity: 0.3 }} />
              <div className="empty-state-title">No notifications available</div>
              <div className="empty-state-desc">You'll receive notifications for new files, announcements, and admin replies</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.map(n => (
              <div key={n.id} onClick={() => !n.isRead && markOne(n.id)} style={{ padding: '16px', background: n.isRead ? 'var(--bg-elevated)' : 'rgba(124,106,255,0.05)', border: `1px solid ${n.isRead ? 'var(--border)' : 'rgba(124,106,255,0.2)'}`, borderRadius: '10px', cursor: n.isRead ? 'default' : 'pointer', transition: 'all 0.15s', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: typeColor[n.type] || 'var(--text-muted)', marginTop: '5px', flexShrink: 0, opacity: n.isRead ? 0.4 : 1 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: n.isRead ? '500' : '600', fontSize: '14px', marginBottom: '4px' }}>{n.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{n.message}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                      <span className={`badge ${typeBadge[n.type] || 'badge-teal'}`} style={{ fontSize: '10px' }}>{typeLabel[n.type] || n.type}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
