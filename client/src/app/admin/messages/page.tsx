'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import type { Message } from '@/lib/types';
import { MessageSquare, Send, CheckCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'alert'>('all');

  const fetchMessages = async () => {
    try { const res = await api.get('/messages'); setMessages(res.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id: string) => {
    try { await api.put(`/messages/${id}/read`); setMessages(ms => ms.map(m => m.id === id ? { ...m, isRead: true } : m)); }
    catch {}
  };

  const sendReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { content: replyContent, parentId });
      toast.success('Reply sent!');
      setReplyContent('');
      await fetchMessages();
      // Refresh selected thread
      if (selected) {
        const updated = messages.find(m => m.id === parentId);
        if (updated) setSelected(updated);
      }
    } catch { toast.error('Failed to send reply'); } finally { setSending(false); }
  };

  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.isRead;
    if (filter === 'alert') return m.type === 'EMERGENCY_ALERT';
    return true;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <DashboardLayout title="Messages" subtitle={`Admin Inbox · ${unreadCount} unread`}>
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', height: 'calc(100vh - 180px)' }}>
        {/* Inbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'unread', 'alert'] as const).map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
                {f === 'all' ? `All (${messages.length})` : f === 'unread' ? `Unread (${unreadCount})` : 'Alerts'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}><div className="spinner" /></div>
              : filtered.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px' }}>
                  <MessageSquare size={28} style={{ opacity: 0.3 }} />
                  <div className="empty-state-title">No messages yet</div>
                </div>
              ) : filtered.map(m => (
                <div key={m.id} onClick={() => { setSelected(m); if (!m.isRead) markRead(m.id); }}
                  style={{ padding: '12px', background: selected?.id === m.id ? 'var(--accent-subtle)' : m.isRead ? 'var(--bg-elevated)' : 'rgba(124,106,255,0.06)', border: `1px solid ${selected?.id === m.id ? 'var(--accent)' : m.isRead ? 'var(--border-subtle)' : 'rgba(124,106,255,0.25)'}`, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {m.type === 'EMERGENCY_ALERT' && <AlertTriangle size={14} color="var(--yellow)" />}
                      <span style={{ fontWeight: m.isRead ? '500' : '700', fontSize: '13px' }}>{m.sender.name}</span>
                      <span className={`badge ${m.sender.role === 'VOLUNTEER' ? 'badge-peach' : 'badge-blue'}`} style={{ fontSize: '10px' }}>{m.sender.role}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{m.content}</div>
                  {m.replies && m.replies.length > 0 && <div style={{ fontSize: '11px', color: 'var(--green)', marginTop: '6px' }}>✓ Replied ({m.replies.length})</div>}
                </div>
              ))}
          </div>
        </div>

        {/* Thread + reply */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          {!selected ? (
            <div className="empty-state" style={{ flex: 1 }}>
              <MessageSquare size={36} style={{ opacity: 0.3 }} />
              <div className="empty-state-title">Select a message</div>
              <div className="empty-state-desc">Click a message on the left to view it and send a reply</div>
            </div>
          ) : (
            <>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{selected.sender.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selected.sender.email} · {selected.sender.role} · {new Date(selected.createdAt).toLocaleString()}</div>
                  </div>
                  {selected.type === 'EMERGENCY_ALERT' && <span className="badge badge-yellow"><AlertTriangle size={12} /> Emergency Alert</span>}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                  <div style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: '4px 12px 12px 12px', padding: '12px 16px', fontSize: '14px' }}>{selected.content}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{selected.sender.name}</div>
                </div>
                {selected.replies?.map(r => (
                  <div key={r.id} style={{ alignSelf: r.sender.role === 'ADMIN' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                    <div style={{ background: r.sender.role === 'ADMIN' ? 'var(--accent)' : 'var(--bg-overlay)', border: r.sender.role !== 'ADMIN' ? '1px solid var(--border)' : 'none', borderRadius: r.sender.role === 'ADMIN' ? '12px 12px 4px 12px' : '4px 12px 12px 12px', padding: '12px 16px', fontSize: '14px', color: r.sender.role === 'ADMIN' ? '#fff' : 'var(--text-primary)' }}>{r.content}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: r.sender.role === 'ADMIN' ? 'right' : 'left', marginTop: '3px' }}>{r.sender.name}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                <textarea className="input" placeholder="Write a reply..." value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={2} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(selected.id); } }} style={{ resize: 'none' }} />
                <button className="btn btn-primary" onClick={() => sendReply(selected.id)} disabled={sending || !replyContent.trim()} style={{ alignSelf: 'flex-end' }}>
                  {sending ? <div className="spinner" /> : <Send size={14} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
