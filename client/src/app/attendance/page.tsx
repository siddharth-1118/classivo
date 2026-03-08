'use client';

import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import type { AttendanceRecord } from '@/lib/types';
import { Upload, ClipboardCheck, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SubjectEntry { subjectName: string; percentage: string; }
interface Summary { subjectName: string; percentage: number; }

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary[]>([]);
  const [overallAvg, setOverallAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'MANUAL' | 'SCREENSHOT' | 'PDF'>('MANUAL');
  const [subjects, setSubjects] = useState<SubjectEntry[]>([{ subjectName: '', percentage: '' }]);
  const [file, setFile] = useState<File | null>(null);
  const [semester, setSemester] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/me');
      setRecords(res.data.records || []);
      setSummary(res.data.summary || []);
      setOverallAvg(res.data.overallAvg);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Handled by DashboardLayout redirect generally, but safety check
        console.log('Profile missing, waiting for redirect...');
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const addSubject = () => setSubjects(s => [...s, { subjectName: '', percentage: '' }]);
  const removeSubject = (i: number) => setSubjects(s => s.filter((_, idx) => idx !== i));
  const updateSubject = (i: number, key: keyof SubjectEntry, val: string) => setSubjects(s => s.map((x, idx) => idx === i ? { ...x, [key]: val } : x));

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('uploadType', uploadType);
      if (semester) formData.append('semester', semester);
      if (uploadType === 'MANUAL') {
        const valid = subjects.filter(s => s.subjectName && s.percentage);
        if (valid.length === 0) { toast.error('Add at least one subject with percentage'); setUploading(false); return; }
        formData.append('subjects', JSON.stringify(valid));
      } else {
        if (!file) { toast.error('Please select a file'); setUploading(false); return; }
        formData.append('file', file);
      }
      await api.post('/attendance', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Attendance uploaded successfully!');
      setFile(null); if (fileRef.current) fileRef.current.value = '';
      setSubjects([{ subjectName: '', percentage: '' }]);
      await fetchAttendance();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  const chartData = {
    labels: summary.map(s => s.subjectName),
    datasets: [{
      label: 'Attendance %',
      data: summary.map(s => s.percentage),
      backgroundColor: summary.map(s => s.percentage < 75 ? 'rgba(243,139,168,0.7)' : s.percentage < 85 ? 'rgba(249,226,175,0.7)' : 'rgba(166,227,161,0.7)'),
      borderColor: summary.map(s => s.percentage < 75 ? '#f38ba8' : s.percentage < 85 ? '#f9e2af' : '#a6e3a1'),
      borderWidth: 1, borderRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(49,50,68,0.5)' }, ticks: { color: '#a6adc8', callback: (v: number | string) => `${v}%` } },
      x: { grid: { display: false }, ticks: { color: '#a6adc8' } },
    },
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: { parsed: { y: number } }) => `${ctx.parsed.y.toFixed(1)}%` } } },
  };

  return (
    <DashboardLayout title="Attendance" subtitle="Track and upload your attendance">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" style={{ width: '32px', height: '32px' }} /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(137,180,250,0.15)' }}><ClipboardCheck size={20} color="var(--blue)" /></div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '500', letterSpacing: '0.05em' }}>Overall Average</div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>{overallAvg != null ? `${overallAvg.toFixed(1)}%` : 'N/A'}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(166,227,161,0.15)' }}><ClipboardCheck size={20} color="var(--green)" /></div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '500', letterSpacing: '0.05em' }}>Subjects Tracked</div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>{summary.length}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(243,139,168,0.15)' }}><AlertTriangle size={20} color="var(--red)" /></div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '500', letterSpacing: '0.05em' }}>Below 75%</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: summary.filter(s => s.percentage < 75).length > 0 ? 'var(--red)' : undefined, marginTop: '4px' }}>{summary.filter(s => s.percentage < 75).length}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
            {/* Upload Form */}
            <div className="card">
              <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Upload Attendance</h2>
              <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="input-group">
                  <label className="input-label">Upload Type</label>
                  <select className="select" value={uploadType} onChange={e => setUploadType(e.target.value as 'MANUAL' | 'SCREENSHOT' | 'PDF')}>
                    <option value="MANUAL">Manual Entry</option>
                    <option value="SCREENSHOT">Screenshot (Academia/Campus Portal)</option>
                    <option value="PDF">PDF Upload</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Semester (optional)</label>
                  <input className="input" placeholder="e.g. 4th" value={semester} onChange={e => setSemester(e.target.value)} />
                </div>

                {uploadType === 'MANUAL' ? (
                  <div>
                    <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>Subject-wise Attendance</label>
                    {subjects.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <input className="input" placeholder="Subject name" value={s.subjectName} onChange={e => updateSubject(i, 'subjectName', e.target.value)} style={{ flex: 2 }} />
                        <input className="input" type="number" placeholder="%" min="0" max="100" value={s.percentage} onChange={e => updateSubject(i, 'percentage', e.target.value)} style={{ flex: 1 }} />
                        {subjects.length > 1 && <button type="button" onClick={() => removeSubject(i)} className="btn btn-danger btn-sm"><Trash2 size={14} /></button>}
                      </div>
                    ))}
                    <button type="button" onClick={addSubject} className="btn btn-secondary btn-sm" style={{ marginTop: '4px' }}><Plus size={14} /> Add Subject</button>
                  </div>
                ) : (
                  <div>
                    <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>Upload File ({uploadType === 'PDF' ? 'PDF' : 'Image/Screenshot'})</label>
                    <div className="dropzone" onClick={() => fileRef.current?.click()}>
                      <Upload size={24} color="var(--text-muted)" />
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{file ? file.name : 'Click to select file'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{uploadType === 'PDF' ? 'PDF files only' : 'JPG, PNG, WebP images'}</div>
                    </div>
                    <input ref={fileRef} type="file" accept={uploadType === 'PDF' ? '.pdf' : 'image/*'} onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-full" disabled={uploading}>
                  {uploading ? <div className="spinner" /> : <Upload size={16} />}
                  {uploading ? 'Uploading...' : 'Upload Attendance'}
                </button>
              </form>
            </div>

            {/* Chart */}
            <div className="card">
              <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Subject-wise Attendance</h2>
              {summary.length === 0 ? (
                <div className="empty-state">
                  <ClipboardCheck size={40} style={{ opacity: 0.3 }} />
                  <div className="empty-state-title">No attendance data yet</div>
                  <div className="empty-state-desc">Upload your attendance to see charts</div>
                </div>
              ) : (
                <div style={{ height: '280px' }}>
                  <Bar data={chartData} options={chartOptions as Parameters<typeof Bar>[0]['options']} />
                </div>
              )}

              {summary.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {summary.map(s => (
                    <div key={s.subjectName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.subjectName}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {s.percentage < 75 && <AlertTriangle size={14} color="var(--red)" />}
                        <span style={{ fontSize: '13px', fontWeight: '600', color: s.percentage < 75 ? 'var(--red)' : s.percentage >= 90 ? 'var(--green)' : 'var(--yellow)' }}>{s.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upload history */}
          <div className="card">
            <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Upload History</h2>
            {records.length === 0 ? (
              <div className="empty-state"><div className="empty-state-title">No records found</div></div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Date</th><th>Subject</th><th>Percentage</th><th>Type</th></tr></thead>
                  <tbody>
                    {records.slice(0, 20).map(r => (
                      <tr key={r.id}>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td>{r.subjectName || '—'}</td>
                        <td><span style={{ color: r.percentage < 75 ? 'var(--red)' : r.percentage >= 90 ? 'var(--green)' : 'var(--yellow)', fontWeight: '600' }}>{r.percentage.toFixed(1)}%</span></td>
                        <td><span className="badge badge-blue">{r.uploadType}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
