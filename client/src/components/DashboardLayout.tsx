'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

interface Props { children: React.ReactNode; title: string; subtitle?: string; }

export default function DashboardLayout({ children, title, subtitle }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!user.profile && window.location.pathname !== '/complete-profile' && user.role !== 'ADMIN') {
        router.push('/complete-profile');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: '32px', height: '32px' }} />
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title={title} subtitle={subtitle} />
        <div className="page-content animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
