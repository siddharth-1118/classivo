'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import type { StudentProfile, Department, Class } from '@/lib/types';
import { User, Mail, Phone, BookOpen, School, Hash, Lock, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EDIT_TOKEN_TITLE = '__PROFILE_EDIT_ACCESS__';

export default function ProfilePage() {
  const { user, setUser } = useAuth() as any;
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasEditAccess, setHasEditAccess] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [form, setForm] = useState({
    name: '', phone: '', rollNumber: '', departmentId: '', classId: '', semester: ''
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get('/students/me');
      setProfile(res.data);
      setForm({
        name: res.data.user?.name || '',
        phone: res.data.user?.phone || '',
        rollNumber: res.data.rollNumber || '',
        departmentId: res.data.departmentId || '',
        classId: res.data.classId || '',
        semester: res.data.semester || '',
      });
    } catch { } finally { setLoading(false); }
  };

  const checkEditAccess = async () => {
    try {
      const res = await api.get('/notifications');
      const notifs = Array.isArray(res.data) ? res.data : (res.data.notifications || []);
      const hasToken = notifs.some((n: any) => n.title === EDIT_TOKEN_TITLE && !n.isRead);
      setHasEditAccess(hasToken);
    } catch { }
  };

  useEffect(() => {
    fetchProfile();
    checkEditAccess();
    api.get('/departments').then(r => setDepartments(r.data)).catch(() => {});
    api.get('/classes').then(r => setClasses(r.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/students/me', form);
      setProfile(res.data);
      setEditing(false);
      setHasEditAccess(false); // Access consumed
      toast.success('Profile updated! Your edit access has been used.');
      // Optionally update AuthContext name
      if (setUser && user) setUser({ ...user, name: form.name, phone: form.phone });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const filteredClasses = classes.filter(c => !form.departmentId || c.departmentId === form.departmentId);
  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ width: '36px', height: '36px', background: 'var(--accent-subtle)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color="var(--accent)" />
      </div>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '14px', fontWeight: '500', marginTop: '2px' }}>{value || '—'}</div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="My Profile" subtitle={editing ? "Editing your profile (one-time access)" : "Your account information"}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" style={{ width: '32px', height: '32px' }} /></div>
      ) : (
        <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Avatar card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '72px', height: '72px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>{user?.name.charAt(0).toUpperCase()}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>{user?.name}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Student</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                {profile?.department && <span className="badge badge-blue">{profile.department.name}</span>}
                {profile?.class && <span className="badge badge-purple">{profile.class.name}</span>}
                {profile?.semester && <span className="badge badge-green">{profile.semester} Semester</span>}
              </div>
            </div>
          </div>

          {/* Access banner */}
          {hasEditAccess && !editing && (
            <div style={{ background: 'var(--green-subtle, rgba(34,197,94,0.1))', border: '1px solid var(--green)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--green)' }}>✅ Profile Edit Access Granted!</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Admin has given you one-time permission to update your profile. This access will be consumed after you save.</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)} style={{ flexShrink: 0, marginLeft: '16px' }}>
                <Edit2 size={13} /> Edit Profile
              </button>
            </div>
          )}

          {/* Profile details — VIEW mode */}
          {!editing && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '600' }}>Personal Information</h2>
                {!hasEditAccess && (
                  <div className="badge badge-yellow" style={{ fontSize: '11px' }}>
                    <Lock size={10} /> Read-only
                  </div>
                )}
              </div>
              {!hasEditAccess && (
                <div className="alert alert-info" style={{ marginBottom: '8px' }}>
                  Your profile is read-only. If you need to make changes, send a query to admin to request edit access.
                </div>
              )}
              <InfoRow icon={User} label="Full Name" value={user?.name} />
              <InfoRow icon={Mail} label="Email Address" value={user?.email} />
              <InfoRow icon={Phone} label="Phone Number" value={user?.phone} />
              <InfoRow icon={Hash} label="Roll Number" value={profile?.rollNumber} />
              <InfoRow icon={BookOpen} label="Department" value={profile?.department?.name} />
              <InfoRow icon={School} label="Class / Section" value={profile?.class?.name} />
              <InfoRow icon={BookOpen} label="Semester" value={profile?.semester ? `${profile.semester} Semester` : undefined} />
            </div>
          )}

          {/* EDIT form — only shown once edit access granted */}
          {editing && (
            <div className="card" style={{ border: '1px solid var(--green)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  <Edit2 size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--green)' }} />
                  Edit Your Profile
                </h2>
                <span className="badge badge-green" style={{ fontSize: '11px' }}>One-time access active</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
                </div>
                <div className="input-group">
                  <label className="input-label">Roll Number</label>
                  <input className="input" value={form.rollNumber} onChange={e => setForm(f => ({ ...f, rollNumber: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Department</label>
                  <select className="select" value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value, classId: '' }))}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Class / Section</label>
                  <select className="select" value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}>
                    <option value="">Select Class</option>
                    {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Semester</label>
                  <select className="select" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                    <option value="">Select Semester</option>
                    {semesters.map(s => <option key={s} value={s}>{s} Semester</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '16px', padding: '10px 12px', background: 'rgba(239,68,68,0.07)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
                ⚠️ <strong>Note:</strong> After saving, your edit access will be consumed and you won't be able to edit again without admin permission.
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setEditing(false)}><X size={14} /> Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <div className="spinner" /> : <Check size={14} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
