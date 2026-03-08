'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import type { Subject, Class, Department } from '@/lib/types';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', classId: '', departmentId: '' });
  const [editing, setEditing] = useState<Subject | null>(null);
  const [editForm, setEditForm] = useState({ name: '', classId: '', departmentId: '' });
  const [saving, setSaving] = useState(false);
  const [filterClass, setFilterClass] = useState('');

  const fetchData = async () => {
    try {
      const [sRes, cRes, dRes] = await Promise.allSettled([api.get('/subjects'), api.get('/classes'), api.get('/departments')]);
      if (sRes.status === 'fulfilled') setSubjects(sRes.value.data);
      if (cRes.status === 'fulfilled') setClasses(cRes.value.data);
      if (dRes.status === 'fulfilled') setDepartments(dRes.value.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (form.classId) {
      const cls = classes.find(c => c.id === form.classId);
      if (cls) setForm(f => ({ ...f, departmentId: cls.departmentId }));
    }
  }, [form.classId]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/subjects', form); toast.success('Subject created!'); setForm({ name: '', classId: '', departmentId: '' }); setShowCreate(false); fetchData(); }
    catch (err: unknown) { toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed'); } finally { setSaving(false); }
  };

  const update = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return; setSaving(true);
    try { await api.put(`/subjects/${editing.id}`, editForm); toast.success('Updated!'); setEditing(null); fetchData(); }
    catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    try { await api.delete(`/subjects/${id}`); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const filtered = filterClass ? subjects.filter(s => s.classId === filterClass) : subjects;

  return (
    <DashboardLayout title="Subjects" subtitle="Manage subjects per class">
      <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
          <select className="select" style={{ width: 'auto', minWidth: '200px' }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({departments.find(d => d.id === c.departmentId)?.name})</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}><Plus size={16} /> Add Subject</button>
        </div>

        {showCreate && (
          <div className="card">
            <form onSubmit={create} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                <label className="input-label">Subject Name</label>
                <input className="input" placeholder="e.g. Data Structures" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="input-group" style={{ flex: 1, minWidth: '180px' }}>
                <label className="input-label">Class</label>
                <select className="select" value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))} required>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
              <thead><tr><th>#</th><th>Subject Name</th><th>Class</th><th>Department</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No subjects found.</td></tr>
                ) : filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      {editing?.id === s.id ? (
                        <form onSubmit={update} style={{ display: 'flex', gap: '8px' }}>
                          <input className="input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ maxWidth: '180px' }} />
                          <select className="select" value={editForm.classId} onChange={e => setEditForm(f => ({ ...f, classId: e.target.value }))}>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}><Check size={13} /></button>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}><X size={13} /></button>
                        </form>
                      ) : <span style={{ fontWeight: '500' }}>{s.name}</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.class?.name || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.department?.name || '—'}</td>
                    <td>
                      {editing?.id !== s.id && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(s); setEditForm({ name: s.name, classId: s.classId, departmentId: s.departmentId }); }}><Edit2 size={13} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(s.id)}><Trash2 size={13} /></button>
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
