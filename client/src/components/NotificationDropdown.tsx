import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check } from 'lucide-react';
import { Notification } from '@/lib/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      // Backend returns { notifications: [...], unreadCount: N }
      setNotifications(Array.isArray(res.data) ? res.data : (res.data.notifications || []));
    } catch (err) {
      console.error(err);
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const sub = setInterval(fetchNotifications, 60000);
    return () => clearInterval(sub);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-muted)', 
          cursor: 'pointer',
          position: 'relative',
          padding: '8px',
          borderRadius: '8px',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', 
            top: '4px', 
            right: '4px', 
            background: 'var(--error)', 
            color: 'white', 
            fontSize: '10px', 
            fontWeight: 'bold',
            padding: '2px 5px',
            borderRadius: '10px',
            border: '2px solid var(--bg-card)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          right: 0, 
          marginTop: '12px',
          width: '320px', 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '12px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          zIndex: 100,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid var(--border-subtle)',
                    background: n.isRead ? 'transparent' : 'rgba(var(--accent-rgb), 0.03)',
                    position: 'relative',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(var(--accent-rgb), 0.03)')}
                >
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: n.isRead ? 'var(--text-primary)' : '#fff', fontWeight: n.isRead ? '400' : '500' }}>
                    {n.title}
                  </p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {n.message}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                    {!n.isRead && (
                      <button 
                        onClick={() => markRead(n.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '2px' }}
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
            <Link href="/notifications" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }} onClick={() => setIsOpen(false)}>
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
