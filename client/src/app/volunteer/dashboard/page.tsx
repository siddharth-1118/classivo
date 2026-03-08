'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import type { FileItem, VolunteerProfile } from '@/lib/types';
import { Upload, FolderOpen, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, filesRes] = await Promise.allSettled([
          api.get('/volunteers/me'),
          api.get('/files'),
        ]);
        if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
        if (filesRes.status === 'fulfilled') setFiles(filesRes.value.data);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const myFiles = files.slice(0, 5);

  return (
    <DashboardLayout title="Volunteer Dashboard" subtitle={`Welcome, ${user?.name}`}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" style={{ width: '32px', height: '32px' }} /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Profile card */}
          {profile && (
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '52px', height: '52px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{user?.name.charAt(0)}</span>
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '16px' }}>{user?.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Class Volunteer</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {profile.department && <span className="badge badge-blue">{profile.department.name}</span>}
                  {profile.class && <span className="badge badge-purple">{profile.class.name}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(166,227,161,0.15)' }}><FolderOpen size={20} color="var(--green)" /></div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '500', letterSpacing: '0.05em' }}>Files Uploaded</div>
                <div style={{ fontSize: '26px', fontWeight: '700', marginTop: '4px' }}>{files.length}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(203,166,247,0.15)' }}><Users size={20} color="var(--purple)" /></div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '500', letterSpacing: '0.05em' }}>Your Class</div>
                <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>{profile?.class?.name || '—'}</div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Link href="/volunteer/upload" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', padding: '28px' }}>
                <Upload size={28} color="var(--accent)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: '600', fontSize: '15px' }}>Upload Resources</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Upload notes, papers, assignments</div>
              </div>
            </Link>
            <Link href="/volunteer/alert" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', padding: '28px', borderColor: 'rgba(249,226,175,0.3)' }}>
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '12px' }}>🚨</span>
                <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--yellow)' }}>Emergency Alert</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Notify admin of urgent issues</div>
              </div>
            </Link>
          </div>

          {/* Recent uploads */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '600' }}>Recent Uploads (Your Class)</h2>
              <Link href="/volunteer/upload" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none' }}>Upload new →</Link>
            </div>
            {myFiles.length === 0 ? (
              <div className="empty-state">
                <FolderOpen size={32} style={{ opacity: 0.3 }} />
                <div className="empty-state-title">No files uploaded yet</div>
                <div className="empty-state-desc">Start uploading study materials for your class</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Title</th><th>Subject</th><th>Category</th><th>Uploaded</th></tr></thead>
                  <tbody>
                    {myFiles.map(f => (
                      <tr key={f.id}>
                        <td style={{ fontWeight: '500' }}>{f.title}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{f.subjectName}</td>
                        <td><span className="badge badge-blue">{f.category.replace('_', ' ')}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{formatDistanceToNow(new Date(f.createdAt), { addSuffix: true })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
