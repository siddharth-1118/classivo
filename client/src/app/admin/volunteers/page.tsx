'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import type { VolunteerProfile, Department, Class } from '@/lib/types';
import { UserPlus, Trash2, Search, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Volunteer extends VolunteerProfile { user: { id: string; name: string; email: string; phone?: string; }; }

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ userId: '', departmentId: '', classId: '' });
  const [students, setStudents] = useState<{ id: string; user: { id: string; name: string; email: string } }[]>([]);
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    try {
      const [vRes, dRes, cRes, sRes] = await Promise.allSettled([
        api.get('/volunteers'), api.get('/departments'), api.get('/classes'), api.get('/students'),
      ]);
      if (vRes.status === 'fulfilled') setVolunteers(vRes.value.data);
      if (dRes.status === 'fulfilled') setDepartments(dRes.value.data);
      if (cRes.status === 'fulfilled') { setAllClasses(cRes.value.data); setClasses(cRes.value.data); }
      if (sRes.status === 'fulfilled') setStudents(sRes.value.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (assignForm.departmentId) setClasses(allClasses.filter(c => c.departmentId === assignForm.departmentId));
    else setClasses(allClasses);
  }, [assignForm.departmentId, allClasses]);

  const assign = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssigning(true);
    try {
      await api.post('/volunteers/assign', assignForm);
      toast.success('Volunteer assigned!');
      setShowAssign(false); setAssignForm({ userId: '', departmentId: '', classId: '' });
      fetchData();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to assign');
    } finally { setAssigning(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this volunteer?')) return;
    try { await api.delete(`/volunteers/${id}`); toast.success('Volunteer removed'); fetchData(); }
    catch { toast.error('Failed to remove'); }
  };

  return (
    <DashboardLayout title="Volunteers" subtitle="Assign and manage class volunteers">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{volunteers.length} volunteer{volunteers.length !== 1 ? 's' : ''}</div>
          <button className="btn btn-primary" onClick={() => setShowAssign(true)}><UserPlus size={16} /> Assign Volunteer</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" style={{ width: '32px', height: '32px' }} /></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Class</th><th>Actions</th></tr></thead>
              <tbody>
                {volunteers.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No volunteers assigned yet.</td></tr>
                ) : volunteers.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: '500' }}>{v.user.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{v.user.email}</td>
                    <td>{v.department?.name || '—'}</td>
                    <td>{v.class?.name || '—'}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => remove(v.id)}><Trash2 size={13} /> Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAssign && (
        <div className="modal-backdrop" onClick={() => setShowAssign(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Assign Volunteer</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAssign(false)}><X size={16} /></button>
            </div>
            <form onSubmit={assign}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="input-group">
                  <label className="input-label">Select Student</label>
                  <select className="select" value={assignForm.userId} onChange={e => setAssignForm(f => ({ ...f, userId: e.target.value }))} required>
                    <option value="">Choose a student...</option>
                    {students.map(s => <option key={s.user.id} value={s.user.id}>{s.user.name} ({s.user.email})</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Department</label>
                  <select className="select" value={assignForm.departmentId} onChange={e => setAssignForm(f => ({ ...f, departmentId: e.target.value, classId: '' }))} required>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Class</label>
                  <select className="select" value={assignForm.classId} onChange={e => setAssignForm(f => ({ ...f, classId: e.target.value }))} required disabled={!assignForm.departmentId}>
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAssign(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={assigning}>{assigning ? 'Assigning...' : <><Check size={14} /> Assign</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
