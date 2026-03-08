'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import type { StudentProfile } from '@/lib/types';
import { Search, Trash2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/DataTable';

interface Student extends StudentProfile { user: { id: string; name: string; email: string; phone?: string; createdAt: string; }; }

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [grantingEdit, setGrantingEdit] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students' + (search ? `?search=${search}` : ''));
      setStudents(res.data);
    } catch {
      toast.error('Failed to fetch students');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchStudents(); }, [search]);

  const deleteStudent = async (id: string, name: string) => {
    if (!confirm(`Delete student "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const grantEditAccess = async (s: Student) => {
    if (s.id.startsWith('pending-')) { toast.error('Student has no profile yet'); return; }
    setGrantingEdit(s.id);
    try {
      await api.post(`/students/${s.id}/grant-edit`);
      toast.success(`✅ Edit access granted to ${s.user.name}! They'll see it in their notifications.`);
    } catch (err) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to grant access');
    } finally { setGrantingEdit(null); }
  };

  const columns = [
    { header: 'Name', accessor: (s: Student) => <span style={{ fontWeight: '600' }}>{s.user.name}</span> },
    { header: 'Roll Number', accessor: (s: Student) => <code style={{ color: 'var(--accent)', fontSize: '13px' }}>{s.rollNumber}</code> },
    { header: 'Email', accessor: (s: Student) => <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.user.email}</span> },
    { header: 'Department', accessor: (s: Student) => s.department?.name || '—' },
    { header: 'Class', accessor: (s: Student) => s.class?.name || '—' },
    { header: 'Semester', accessor: (s: Student) => <span className="badge badge-blue">{s.semester}</span> },
  ];


  return (
    <DashboardLayout title="Students" subtitle="Manage all registered students">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder="Search name, roll, or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
            {students.length} Total Students
          </div>
        </div>

        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <DataTable 
            columns={columns} 
            data={students} 
            loading={loading}
            emptyTitle="No students found"
            emptyDescription="Registered students will appear here."
            actions={(s: Student) => (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => grantEditAccess(s)}
                  disabled={grantingEdit === s.id || s.id.startsWith('pending-')}
                  title="Grant student one-time permission to edit their own profile"
                  style={{ color: 'var(--green)' }}
                >
                  {grantingEdit === s.id ? <div className="spinner" /> : <KeyRound size={14} />}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteStudent(s.id, s.user.name)} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
