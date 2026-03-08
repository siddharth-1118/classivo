'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, UserCheck, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Department, Class } from '@/lib/types';

export default function CompleteProfilePage() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [role, setRole] = useState<'STUDENT' | 'VOLUNTEER' | ''>('');
  const [form, setForm] = useState({ rollNumber: '', departmentName: '', className: '', semester: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user?.profile) router.push('/dashboard');
  }, [user, authLoading, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return toast.error('Please select a role');
    if (!form.departmentName || !form.className) return toast.error('Please enter department and class');
    if (role === 'STUDENT' && (!form.rollNumber || !form.semester)) return toast.error('Please fill all student details');

    setSubmitting(true);
    console.log('[DEBUG] Submitting profile update to /auth/profile-setup:', { ...form, role });
    try {
      const res = await api.post('/auth/profile-setup', { ...form, role });
      console.log('[DEBUG] Profile update response:', res.data);
      await refreshUser();
      toast.success('Profile completed!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <Loader2 className="spinner" size={32} />
      </div>
    );
  }

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>One last step!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Tell us more about yourself to set up your dashboard.</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Role Selection */}
            <div>
              <label className="input-label" style={{ marginBottom: '12px', display: 'block' }}>I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div 
                  onClick={() => setRole('STUDENT')}
                  className={`card ${role === 'STUDENT' ? 'selected' : ''}`}
                  style={{ 
                    cursor: 'pointer', textAlign: 'center', padding: '20px', 
                    border: role === 'STUDENT' ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: role === 'STUDENT' ? 'rgba(137, 180, 250, 0.05)' : 'transparent'
                  }}
                >
                  <GraduationCap size={32} color={role === 'STUDENT' ? 'var(--accent)' : 'var(--text-muted)'} style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: '600', fontSize: '15px' }}>Student</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Access materials & track attendance</div>
                </div>
                <div 
                  onClick={() => setRole('VOLUNTEER')}
                  className={`card ${role === 'VOLUNTEER' ? 'selected' : ''}`}
                  style={{ 
                    cursor: 'pointer', textAlign: 'center', padding: '20px',
                    border: role === 'VOLUNTEER' ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: role === 'VOLUNTEER' ? 'rgba(137, 180, 250, 0.05)' : 'transparent'
                  }}
                >
                  <UserCheck size={32} color={role === 'VOLUNTEER' ? 'var(--accent)' : 'var(--text-muted)'} style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: '600', fontSize: '15px' }}>Volunteer</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Upload notes & manage resources</div>
                </div>
              </div>
            </div>

            {role && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">Department</label>
                    <input className="input" placeholder="e.g. Computer Science" value={form.departmentName} onChange={e => setForm(f => ({ ...f, departmentName: e.target.value }))} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Class</label>
                    <input className="input" placeholder="e.g. CSE-A" value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value }))} required />
                  </div>
                </div>

                {role === 'STUDENT' && (
                  <div className="form-grid">
                    <div className="input-group">
                      <label className="input-label">Roll Number</label>
                      <input className="input" placeholder="e.g. RA2211..." value={form.rollNumber} onChange={e => setForm(f => ({ ...f, rollNumber: e.target.value }))} required />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Semester</label>
                      <select className="select" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} required>
                        <option value="">Select Semester</option>
                        {semesters.map(s => <option key={s} value={s}>{s} Semester</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {role === 'VOLUNTEER' && (
                  <div className="alert alert-info" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <ShieldCheck size={18} style={{ marginTop: '2px' }} />
                    <div style={{ fontSize: '13px' }}>
                      <strong>Note:</strong> Volunteer accounts need to be approved by an administrator before you can upload materials.
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting} style={{ marginTop: '12px' }}>
                  {submitting ? <Loader2 className="spinner" size={18} /> : <span>Complete Setup <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} /></span>}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
