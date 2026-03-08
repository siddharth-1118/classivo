'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import type { Class, Department } from '@/lib/types';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', departmentId: '' });
  const [editing, setEditing] = useState<Class | null>(null);
  const [editForm, setEditForm] = useState({ name: '', departmentId: '' });
  const [saving, setSaving] = useState(false);
  const [filterDept, setFilterDept] = useState('');

  const fetchData = async () => {
    try {
      const [cRes, dRes] = await Promise.allSettled([api.get('/classes'), api.get('/departments')]);
      if (cRes.status === 'fulfilled') setClasses(cRes.value.data);
      if (dRes.status === 'fulfilled') setDepartments(dRes.value.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/classes', form); toast.success('Class created!'); setForm({ name: '', departmentId: '' }); setShowCreate(false); fetchData(); }
    catch (err: unknown) { toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed'); } finally { setSaving(false); }
  };

  const update = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return; setSaving(true);
    try { await api.put(`/classes/${editing.id}`, editForm); toast.success('Updated!'); setEditing(null); fetchData(); }
    catch { toast.error('Failed to update'); } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this class?')) return;
    try { await api.delete(`/classes/${id}`); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = filterDept ? classes.filter(c => c.departmentId === filterDept) : classes;

  return (
    <DashboardLayout title="Classes" subtitle="Manage class sections per department">
      <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
          <select className="select" style={{ width: 'auto', minWidth: '200px' }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}><Plus size={16} /> Add Class</button>
        </div>

        {showCreate && (
          <div className="card">
            <form onSubmit={create} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Class Name</label>
                <input className="input" placeholder="e.g. CSE-A, CSE-B" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Department</label>
                <select className="select" value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}><Check size={16} /></button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}><X size={16} /></button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>#</th><th>Class Name</th><th>Department</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No classes found.</td></tr>
                ) : filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      {editing?.id === c.id ? (
                        <form onSubmit={update} style={{ display: 'flex', gap: '8px' }}>
                          <input className="input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ maxWidth: '160px' }} />
                          <select className="select" value={editForm.departmentId} onChange={e => setEditForm(f => ({ ...f, departmentId: e.target.value }))}>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}><Check size={13} /></button>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}><X size={13} /></button>
                        </form>
                      ) : <span style={{ fontWeight: '500' }}>{c.name}</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.department?.name || '—'}</td>
                    <td>
                      {editing?.id !== c.id && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(c); setEditForm({ name: c.name, departmentId: c.departmentId }); }}><Edit2 size={13} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(c.id)}><Trash2 size={13} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
