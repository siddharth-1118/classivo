'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import type { FileItem } from '@/lib/types';
import { Trash2, Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const catLabel: Record<string, string> = { QUESTION_PAPER: 'Question Paper', NOTES: 'Notes', ASSIGNMENT: 'Assignment', STUDY_MATERIAL: 'Study Material' };
const catBadge: Record<string, string> = { QUESTION_PAPER: 'badge-yellow', NOTES: 'badge-blue', ASSIGNMENT: 'badge-peach', STUDY_MATERIAL: 'badge-green' };

export default function AdminFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filtered, setFiltered] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchFiles = async () => {
    try {
      const params = category ? `?category=${category}` : '';
      const res = await api.get('/files' + params);
      setFiles(res.data);
      setFiltered(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchFiles(); }, [category]);

  useEffect(() => {
    if (!search) { setFiltered(files); return; }
    setFiltered(files.filter(f => f.title.toLowerCase().includes(search.toLowerCase()) || f.subjectName.toLowerCase().includes(search.toLowerCase()) || f.uploader?.user?.name?.toLowerCase().includes(search.toLowerCase())));
  }, [search, files]);

  const formatSize = (size?: number) => {
    if (!size) return '—';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };

  const deleteFile = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await api.delete(`/files/${id}`); toast.success('File deleted'); fetchFiles(); }
    catch { toast.error('Failed to delete'); }
  };

  const downloadFile = async (file: FileItem) => {
    try {
      const res = await api.get(`/files/${file.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = file.fileName; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  return (
    <DashboardLayout title="File Management" subtitle="View and manage all uploaded files">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: '360px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder="Search by title, subject, or uploader..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width: 'auto', minWidth: '180px' }} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="QUESTION_PAPER">Question Papers</option>
            <option value="NOTES">Notes</option>
            <option value="ASSIGNMENT">Assignments</option>
            <option value="STUDY_MATERIAL">Study Materials</option>
          </select>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} file{filtered.length !== 1 ? 's' : ''}</div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" style={{ width: '32px', height: '32px' }} /></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Title</th><th>Subject</th><th>Category</th><th>Type</th><th>Class</th><th>Uploaded by</th><th>Size</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No files found.</td></tr>
                ) : filtered.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: '500', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{f.subjectName}</td>
                    <td><span className={`badge ${catBadge[f.category] || 'badge-blue'}`} style={{ fontSize: '10px' }}>{catLabel[f.category]}</span></td>
                    <td><span className="badge badge-teal" style={{ fontSize: '10px' }}>{f.fileType}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{f.class?.name || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{f.uploader?.user?.name || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatSize(f.fileSize)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{formatDistanceToNow(new Date(f.createdAt), { addSuffix: true })}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => downloadFile(f)}><Download size={13} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteFile(f.id, f.title)}><Trash2 size={13} /></button>
                      </div>
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
