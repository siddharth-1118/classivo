'use client';

import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import type { FileItem } from '@/lib/types';
import { FolderOpen, Download, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const catLabel: Record<string, string> = { QUESTION_PAPER: 'Question Paper', NOTES: 'Notes', ASSIGNMENT: 'Assignment', STUDY_MATERIAL: 'Study Material' };
const catBadge: Record<string, string> = { QUESTION_PAPER: 'badge-yellow', NOTES: 'badge-blue', ASSIGNMENT: 'badge-peach', STUDY_MATERIAL: 'badge-green' };
const typeIcon: Record<string, string> = { PDF: '📄', DOC: '📝', DOCX: '📝', IMAGE: '🖼️', OTHER: '📎' };

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filtered, setFiltered] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      const res = await api.get('/files?' + params.toString());
      setFiles(res.data);
      setFiltered(res.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
         toast.error('Complete your profile to access files');
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchFiles(); }, [category]);

  useEffect(() => {
    let f = files;
    if (search) f = f.filter(x => x.title.toLowerCase().includes(search.toLowerCase()) || x.subjectName.toLowerCase().includes(search.toLowerCase()) || x.description?.toLowerCase().includes(search.toLowerCase()));
    if (subject) f = f.filter(x => x.subjectName.toLowerCase().includes(subject.toLowerCase()));
    setFiltered(f);
  }, [search, subject, files]);

  const subjects = [...new Set(files.map(f => f.subjectName))].sort();

  const handleDownload = async (file: FileItem) => {
    setDownloading(file.id);
    try {
      const res = await api.get(`/files/${file.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = file.fileName; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch { toast.error('Download failed'); } finally { setDownloading(null); }
  };

  return (
    <DashboardLayout title="Study Materials" subtitle="Browse and download academic resources for your class">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input placeholder="Search files by title, subject or description..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width: 'auto', minWidth: '160px' }} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="QUESTION_PAPER">Question Papers</option>
            <option value="NOTES">Notes</option>
            <option value="ASSIGNMENT">Assignments</option>
            <option value="STUDY_MATERIAL">Study Materials</option>
          </select>
          <select className="select" style={{ width: 'auto', minWidth: '160px' }} value={subject} onChange={e => setSubject(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(search || category || subject) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCategory(''); setSubject(''); }}>Clear filters</button>
          )}
        </div>

        {/* Results count */}
        {!loading && <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{filtered.length} file{filtered.length !== 1 ? 's' : ''} found</div>}

        {/* Files grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" style={{ width: '32px', height: '32px' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <FolderOpen size={48} style={{ opacity: 0.3 }} />
              <div className="empty-state-title">{search || category || subject ? 'No files match your filters' : 'No study materials uploaded yet'}</div>
              <div className="empty-state-desc">Files uploaded by your class volunteer will appear here</div>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Uploaded by</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{typeIcon[f.fileType] || '📎'}</span>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13px' }}>{f.title}</div>
                          {f.description && <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{f.subjectName}</td>
                    <td><span className={`badge ${catBadge[f.category] || 'badge-blue'}`}>{catLabel[f.category] || f.category}</span></td>
                    <td><span className="badge badge-teal">{f.fileType}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{f.uploader?.user?.name || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatDistanceToNow(new Date(f.createdAt), { addSuffix: true })}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => handleDownload(f)} disabled={downloading === f.id}>
                        {downloading === f.id ? <div className="spinner" /> : <Download size={14} />}
                        {downloading === f.id ? 'Downloading...' : 'Download'}
                      </button>
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
