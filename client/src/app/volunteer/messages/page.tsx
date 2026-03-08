'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import type { Message } from '@/lib/types';
import { MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function VolunteerMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [selected, setSelected] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const fetchMessages = async () => {
    try { const res = await api.get('/messages'); setMessages(res.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { content, type: 'MESSAGE' });
      toast.success('Message sent!'); setContent(''); await fetchMessages();
    } catch { toast.error('Failed to send'); } finally { setSending(false); }
  };

  const sendReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { content: replyContent, parentId });
      toast.success('Reply sent!'); setReplyContent(''); await fetchMessages();
      const updated = await api.get(`/messages/${parentId}`);
      setSelected(updated.data);
    } catch { toast.error('Failed to send reply'); } finally { setSending(false); }
  };

  return (
    <DashboardLayout title="Messages" subtitle="Communicate with the admin">
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', height: 'calc(100vh - 180px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          <div className="card">
            <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>New Message</h2>
            <form onSubmit={send} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea className="input" rows={3} placeholder="Write to admin..." value={content} onChange={e => setContent(e.target.value)} required />
              <button type="submit" className="btn btn-primary btn-full" disabled={sending || !content.trim()}>
                {sending ? <div className="spinner" /> : <Send size={14} />} Send
              </button>
            </form>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Thread History</h2>
            {loading ? <div style={{ display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div> : messages.length === 0 ? (
              <div className="empty-state"><MessageSquare size={28} style={{ opacity: 0.3 }} /><div className="empty-state-title">No messages yet</div></div>
            ) : messages.map(m => (
              <div key={m.id} onClick={() => setSelected(m)} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${selected?.id === m.id ? 'var(--accent)' : 'var(--border-subtle)'}`, background: selected?.id === m.id ? 'var(--accent-subtle)' : 'var(--bg-overlay)', cursor: 'pointer', marginBottom: '6px' }}>
                <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{m.content}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}</span>
                  {m.replies && m.replies.length > 0 && <span style={{ color: 'var(--green)' }}>✓ {m.replies.length} reply</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          {!selected ? (
            <div className="empty-state" style={{ flex: 1 }}>
              <MessageSquare size={36} style={{ opacity: 0.3 }} />
              <div className="empty-state-title">Select a message to view thread</div>
            </div>
          ) : (
            <>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(selected.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
                  <div style={{ background: 'var(--accent)', borderRadius: '12px 12px 4px 12px', padding: '12px 16px', color: '#fff', fontSize: '14px' }}>{selected.content}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '3px' }}>You</div>
                </div>
                {selected.replies?.map(r => (
                  <div key={r.id} style={{ alignSelf: r.sender.role === 'ADMIN' ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
                    <div style={{ background: r.sender.role === 'ADMIN' ? 'var(--bg-overlay)' : 'var(--accent)', border: r.sender.role === 'ADMIN' ? '1px solid var(--border)' : 'none', borderRadius: r.sender.role === 'ADMIN' ? '12px 12px 12px 4px' : '12px 12px 4px 12px', padding: '12px 16px', fontSize: '14px', color: r.sender.role === 'ADMIN' ? 'var(--text-primary)' : '#fff' }}>{r.content}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: r.sender.role === 'ADMIN' ? 'left' : 'right', marginTop: '3px' }}>{r.sender.name}</div>
                  </div>
                ))}
              </div>
              {selected.replies && selected.replies.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                  <input className="input" placeholder="Reply..." value={replyContent} onChange={e => setReplyContent(e.target.value)} />
                  <button className="btn btn-primary" onClick={() => sendReply(selected.id)} disabled={!replyContent.trim()}><Send size={14} /></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
