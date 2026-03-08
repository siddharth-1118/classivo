'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, UserPlus } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', rollNumber: '', departmentName: '', className: '', semester: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departmentName || !form.className) return toast.error('Please enter department and class');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Account created! Please log in.');
      router.push('/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '540px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: 'var(--accent)', borderRadius: '16px', marginBottom: '16px' }}>
            <GraduationCap size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Classivo</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>Student Registration</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Create your account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>After registration, your details can only be updated by an admin.</p>

          {/* Form */}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input className="input" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Roll Number</label>
                <input className="input" placeholder="RA2211003010001" value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)} required />
              </div>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input className="input" type="email" placeholder="john@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input className="input" type="tel" placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Department</label>
                <input className="input" placeholder="e.g. Computer Science" value={form.departmentName} onChange={e => set('departmentName', e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Class / Section</label>
                <input className="input" placeholder="e.g. CSE-A" value={form.className} onChange={e => set('className', e.target.value)} required />
              </div>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Semester</label>
                <select className="select" value={form.semester} onChange={e => set('semester', e.target.value)} required>
                  <option value="">Select Semester</option>
                  {semesters.map(s => <option key={s} value={s}>{s} Semester</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input className="input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? <div className="spinner" /> : <UserPlus size={18} />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="divider" style={{ margin: '24px 0' }} />
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', fontWeight: '500', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
