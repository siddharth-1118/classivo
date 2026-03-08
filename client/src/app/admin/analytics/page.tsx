'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { BarChart3 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface AttAnalytics { bySubject: { subject: string; avg: number; count: number; low: number }[]; byClass: { className: string; avg: number; count: number }[]; total: number; }
interface FileAnalytics { totalFiles: number; byCategory: Record<string, number>; byClass: Record<string, number>; topDownloaded: { id: string; title: string; downloads: number }[]; }

export default function AdminAnalyticsPage() {
  const [att, setAtt] = useState<AttAnalytics | null>(null);
  const [files, setFiles] = useState<FileAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, fileRes] = await Promise.allSettled([api.get('/admin/analytics/attendance'), api.get('/admin/analytics/files')]);
        if (attRes.status === 'fulfilled') setAtt(attRes.value.data);
        if (fileRes.status === 'fulfilled') setFiles(fileRes.value.data);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const attSubjectChart = att ? {
    labels: att.bySubject.map(s => s.subject),
    datasets: [{
      label: 'Average Attendance %',
      data: att.bySubject.map(s => s.avg),
      backgroundColor: att.bySubject.map(s => s.avg < 75 ? 'rgba(243,139,168,0.7)' : s.avg < 85 ? 'rgba(249,226,175,0.7)' : 'rgba(166,227,161,0.7)'),
      borderRadius: 6,
    }],
  } : null;

  const attClassChart = att ? {
    labels: att.byClass.map(c => c.className),
    datasets: [{
      label: 'Average Attendance %',
      data: att.byClass.map(c => c.avg),
      backgroundColor: ['rgba(137,180,250,0.7)', 'rgba(203,166,247,0.7)', 'rgba(166,227,161,0.7)', 'rgba(249,226,175,0.7)', 'rgba(148,226,213,0.7)'],
      borderRadius: 6,
    }],
  } : null;

  const fileCatChart = files && Object.keys(files.byCategory).length > 0 ? {
    labels: Object.keys(files.byCategory).map(k => k.replace('_', ' ')),
    datasets: [{
      data: Object.values(files.byCategory),
      backgroundColor: ['rgba(249,226,175,0.8)', 'rgba(137,180,250,0.8)', 'rgba(250,179,135,0.8)', 'rgba(166,227,161,0.8)'],
      borderWidth: 0,
    }],
  } : null;

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(49,50,68,0.5)' }, ticks: { color: '#a6adc8', callback: (v: number | string) => `${v}%` } },
      x: { grid: { display: false }, ticks: { color: '#a6adc8' } },
    },
    plugins: { legend: { display: false } },
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right' as const, labels: { color: '#a6adc8', boxWidth: 12 } } },
  };

  const hasNoData = !att || att.total === 0;

  return (
    <DashboardLayout title="Analytics" subtitle="Platform-wide statistics and insights">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" style={{ width: '32px', height: '32px' }} /></div>
      ) : hasNoData && (!files || files.totalFiles === 0) ? (
        <div className="card">
          <div className="empty-state">
            <BarChart3 size={48} style={{ opacity: 0.3 }} />
            <div className="empty-state-title">Not enough data to display analytics yet</div>
            <div className="empty-state-desc">Analytics will populate as students upload attendance and volunteers upload files</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(137,180,250,0.15)' }}><BarChart3 size={20} color="var(--blue)" /></div>
              <div><div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '500', letterSpacing: '0.05em' }}>Total Attendance Records</div><div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>{att?.total || 0}</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(166,227,161,0.15)' }}><BarChart3 size={20} color="var(--green)" /></div>
              <div><div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '500', letterSpacing: '0.05em' }}>Subjects Tracked</div><div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>{att?.bySubject.length || 0}</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(243,139,168,0.15)' }}><BarChart3 size={20} color="var(--red)" /></div>
              <div><div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '500', letterSpacing: '0.05em' }}>Low Attendance (&lt;75%)</div><div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px', color: 'var(--red)' }}>{att?.bySubject.reduce((a, s) => a + s.low, 0) || 0}</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(203,166,247,0.15)' }}><BarChart3 size={20} color="var(--purple)" /></div>
              <div><div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '500', letterSpacing: '0.05em' }}>Total Files</div><div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>{files?.totalFiles || 0}</div></div>
            </div>
          </div>

          {/* Charts row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card">
              <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Attendance by Subject</h2>
              {attSubjectChart && att && att.bySubject.length > 0 ? (
                <div style={{ height: '260px' }}><Bar data={attSubjectChart} options={barOptions as Parameters<typeof Bar>[0]['options']} /></div>
              ) : (
                <div className="empty-state"><div className="empty-state-title">No attendance data</div></div>
              )}
            </div>
            <div className="card">
              <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Attendance by Class</h2>
              {attClassChart && att && att.byClass.length > 0 ? (
                <div style={{ height: '260px' }}><Bar data={attClassChart} options={barOptions as Parameters<typeof Bar>[0]['options']} /></div>
              ) : (
                <div className="empty-state"><div className="empty-state-title">No class data</div></div>
              )}
            </div>
          </div>

          {/* Charts row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card">
              <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Files by Category</h2>
              {fileCatChart ? (
                <div style={{ height: '220px' }}><Doughnut data={fileCatChart} options={doughnutOptions} /></div>
              ) : (
                <div className="empty-state"><div className="empty-state-title">No file data</div></div>
              )}
            </div>
            <div className="card">
              <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Top Downloaded Files</h2>
              {files && files.topDownloaded.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {files.topDownloaded.map((f, i) => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--accent)', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', flexShrink: 0 }}>{f.downloads} ↓</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state"><div className="empty-state-title">No downloads yet</div></div>
              )}
            </div>
          </div>

          {/* Subject-wise detail table */}
          {att && att.bySubject.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '14px' }}>Subject-wise Attendance Detail</h2>
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Subject</th><th>Average</th><th>Records</th><th>Below 75%</th><th>Status</th></tr></thead>
                  <tbody>
                    {att.bySubject.map(s => (
                      <tr key={s.subject}>
                        <td style={{ fontWeight: '500' }}>{s.subject}</td>
                        <td><span style={{ fontWeight: '700', color: s.avg < 75 ? 'var(--red)' : s.avg >= 90 ? 'var(--green)' : 'var(--yellow)' }}>{s.avg.toFixed(1)}%</span></td>
                        <td style={{ color: 'var(--text-muted)' }}>{s.count}</td>
                        <td style={{ color: s.low > 0 ? 'var(--red)' : 'var(--text-muted)' }}>{s.low}</td>
                        <td><span className={`badge ${s.avg < 75 ? 'badge-red' : s.avg >= 90 ? 'badge-green' : 'badge-yellow'}`}>{s.avg < 75 ? 'Critical' : s.avg >= 90 ? 'Excellent' : 'Good'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
