'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { AlertTriangle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmergencyAlertPage() {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { content, type: 'EMERGENCY_ALERT' });
      toast.success('🚨 Emergency alert sent to admin!');
      setSent(true); setContent('');
    } catch { toast.error('Failed to send alert'); } finally { setSending(false); }
  };

  const examples = ['Surprise test tomorrow – please prepare!', 'Lab class cancelled for today', 'Assignment deadline changed to tomorrow', 'Professor announced extra class on Saturday'];

  return (
    <DashboardLayout title="Emergency Alert" subtitle="Send urgent notifications to the admin">
      <div style={{ maxWidth: '600px' }}>
        <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div>Emergency alerts are sent directly to the admin and are treated with high priority. Use only for urgent class-related issues.</div>
        </div>

        {sent && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            ✅ Alert sent successfully! Admin has been notified.
          </div>
        )}

        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--yellow)" /> New Emergency Alert
          </h2>
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="input-group">
              <label className="input-label">Alert Message *</label>
              <textarea className="input" rows={4} placeholder="Describe the emergency situation clearly..." value={content} onChange={e => setContent(e.target.value)} required style={{ minHeight: '120px' }} />
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>{content.length} characters</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>Quick examples:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {examples.map(ex => (
                  <button key={ex} type="button" className="btn btn-ghost btn-sm" onClick={() => setContent(ex)} style={{ fontSize: '12px' }}>{ex}</button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-lg" disabled={sending || !content.trim()} style={{ background: 'rgba(249,226,175,0.15)', color: 'var(--yellow)', border: '1px solid rgba(249,226,175,0.3)', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
              {sending ? <div className="spinner" /> : <AlertTriangle size={18} />}
              {sending ? 'Sending Alert...' : '🚨 Send Emergency Alert'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: '16px' }} className="card">
          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: 'var(--text-secondary)' }}>When to use Emergency Alerts?</h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <li>Surprise tests or exams announced by class teacher</li>
            <li>Sudden class cancellations or venue changes</li>
            <li>Urgent submission deadlines</li>
            <li>Safety or facility issues in the classroom</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
