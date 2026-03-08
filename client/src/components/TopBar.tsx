'use client';

import { useAuth } from '@/contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

interface TopBarProps { title: string; subtitle?: string; }

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { user, loading } = useAuth();

  return (
    <div className="top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontWeight: '600', fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Only render (and fetch) notifications once user is confirmed */}
        {!loading && user && <NotificationDropdown />}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid var(--border-subtle)' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{user?.name}</p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{user?.role}</p>
          </div>
          <div style={{ width: '40px', height: '40px', background: 'var(--accent-subtle)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent)' }}>{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
