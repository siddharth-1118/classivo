'use client';

import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import type { Department, Class } from '@/lib/types';
import { Upload, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [form, setForm] = useState({ title: '', description: '', subjectName: '', category: 'STUDY_MATERIAL', classId: '', departmentId: '' });
  const [file, setFile] = useState<File | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Pre-fill from volunteer profile
    api.get('/volunteers/me').then(res => {
      setForm(f => ({ ...f, departmentId: res.data.departmentId || '', classId: res.data.classId || '' }));
    }).catch(() => {});
    api.get('/departments').then(r => setDepartments(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.departmentId) {
      api.get(`/classes?departmentId=${form.departmentId}`).then(r => setClasses(r.data)).catch(() => {});
    }
  }, [form.departmentId]);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file to upload');
    if (!form.classId || !form.departmentId) return toast.error('Class and department are required');

    setUploading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append('file', file);

      await api.post('/files', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('File uploaded successfully! Students in your class will be notified.');
      setForm(f => ({ ...f, title: '', description: '', subjectName: '', category: 'STUDY_MATERIAL' }));
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const maxSize = 20 * 1024 * 1024;
  const isOverSize = file && file.size > maxSize;

  return (
    <DashboardLayout title="Upload Resources" subtitle="Upload academic materials for your class">
      <div style={{ maxWidth: '680px' }}>
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Title *</label>
                <input className="input" placeholder="e.g. Unit 3 Notes – Data Structures" value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Subject Name *</label>
                <input className="input" placeholder="e.g. Data Structures & Algorithms" value={form.subjectName} onChange={e => set('subjectName', e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input" placeholder="Brief description of this resource..." value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
            </div>

            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Category *</label>
                <select className="select" value={form.category} onChange={e => set('category', e.target.value)} required>
                  <option value="STUDY_MATERIAL">Study Material</option>
                  <option value="NOTES">Notes</option>
                  <option value="QUESTION_PAPER">Question Paper</option>
                  <option value="ASSIGNMENT">Assignment</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Department *</label>
                <select className="select" value={form.departmentId} onChange={e => set('departmentId', e.target.value)} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Class / Section *</label>
              <select className="select" value={form.classId} onChange={e => set('classId', e.target.value)} required disabled={!form.departmentId}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* File dropzone */}
            <div className="input-group">
              <label className="input-label">File *</label>
              <div
                className={`dropzone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                {file ? (
                  <>
                    <FolderOpen size={28} color="var(--accent)" />
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{file.name}</div>
                    <div style={{ fontSize: '12px', color: isOverSize ? 'var(--red)' : 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB {isOverSize ? '(exceeds 20MB limit)' : ''}</div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setFile(null); }}>Remove</button>
                  </>
                ) : (
                  <>
                    <Upload size={28} color="var(--text-muted)" />
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Drag & drop file here, or click to browse</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supported: PDF, DOC, DOCX, Images (max 20MB)</div>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={uploading || !file || !!isOverSize}>
              {uploading ? <div className="spinner" /> : <Upload size={18} />}
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>
        </div>

        <div className="alert alert-info" style={{ marginTop: '16px' }}>
          Students in the selected class will receive an automatic notification when you upload a file.
        </div>
      </div>
    </DashboardLayout>
  );
}
