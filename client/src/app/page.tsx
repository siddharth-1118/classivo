'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login');
      else if (user.role === 'ADMIN') router.replace('/admin');
      else if (user.role === 'VOLUNTEER') router.replace('/volunteer/dashboard');
      else router.replace('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div className="spinner" style={{ width: '32px', height: '32px' }} />
    </div>
  );
}
