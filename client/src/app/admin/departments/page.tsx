'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import type { Department } from '@/lib/types';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [editing, setEditing] = useState<Department | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDepts = async () => {
    try { const res = await api.get('/departments'); setDepartments(res.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchDepts(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/departments', { name: createName }); toast.success('Department created!'); setCreateName(''); setShowCreate(false); fetchDepts(); }
    catch (err: unknown) { toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const update = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return; setSaving(true);
    try { await api.put(`/departments/${editing.id}`, { name: editName }); toast.success('Updated!'); setEditing(null); fetchDepts(); }
    catch { toast.error('Failed to update'); } finally { setSaving(false); }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete department "${name}"? This will also delete all related classes and subjects.`)) return;
    try { await api.delete(`/departments/${id}`); toast.success('Deleted'); fetchDepts(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <DashboardLayout title="Departments" subtitle="Manage academic departments">
      <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}><Plus size={16} /> Add Department</button>
        </div>

        {showCreate && (
          <div className="card">
            <form onSubmit={create} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Department Name</label>
                <input className="input" placeholder="e.g. Computer Science and Engineering" value={createName} onChange={e => setCreateName(e.target.value)} required autoFocus />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}><Check size={16} /></button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowCreate(false); setCreateName(''); }}><X size={16} /></button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>#</th><th>Department Name</th><th>Actions</th></tr></thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No departments found. Add one to get started.</td></tr>
                ) : departments.map((d, i) => (
                  <tr key={d.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      {editing?.id === d.id ? (
                        <form onSubmit={update} style={{ display: 'flex', gap: '8px' }}>
                          <input className="input" value={editName} onChange={e => setEditName(e.target.value)} autoFocus style={{ maxWidth: '300px' }} />
                          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}><Check size={13} /></button>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}><X size={13} /></button>
                        </form>
                      ) : <span style={{ fontWeight: '500' }}>{d.name}</span>}
                    </td>
                    <td>
                      {editing?.id !== d.id && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(d); setEditName(d.name); }}><Edit2 size={13} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(d.id, d.name)}><Trash2 size={13} /></button>
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
