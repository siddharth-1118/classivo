'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import type { Message } from '@/lib/types';
import { MessageSquare, Send, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState('');
  const [msgType, setMsgType] = useState<'MESSAGE' | 'EMERGENCY_ALERT'>('MESSAGE');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [selectedThread, setSelectedThread] = useState<Message | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages');
      setMessages(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { content, type: msgType });
      toast.success(msgType === 'EMERGENCY_ALERT' ? '🚨 Emergency alert sent to admin!' : 'Message sent!');
      setContent(''); setMsgType('MESSAGE');
      await fetchMessages();
    } catch { toast.error('Failed to send message'); } finally { setSending(false); }
  };

  const sendReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { content: replyContent, parentId });
      toast.success('Reply sent!');
      setReplyContent(''); setReplyTo(null);
      await fetchMessages();
    } catch { toast.error('Failed to send reply'); } finally { setSending(false); }
  };

  return (
    <DashboardLayout title="Messages" subtitle="Send messages and emergency alerts to admin">
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', height: 'calc(100vh - 180px)' }}>
        {/* Left: Compose + thread list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {/* Compose */}
          <div className="card">
            <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '14px' }}>New Message</h2>
            <form onSubmit={sendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select className="select" value={msgType} onChange={e => setMsgType(e.target.value as 'MESSAGE' | 'EMERGENCY_ALERT')}>
                <option value="MESSAGE">Regular Message</option>
                <option value="EMERGENCY_ALERT">🚨 Emergency Alert</option>
              </select>
              {msgType === 'EMERGENCY_ALERT' && (
                <div className="alert alert-warning"><AlertTriangle size={16} />Emergency alerts notify admin immediately</div>
              )}
              <textarea className="input" rows={4} placeholder={msgType === 'EMERGENCY_ALERT' ? 'Describe the emergency (e.g. Surprise test tomorrow)...' : 'Write your message to admin...'} value={content} onChange={e => setContent(e.target.value)} required style={{ minHeight: '100px' }} />
              <button type="submit" className="btn btn-primary btn-full" disabled={sending || !content.trim()}>
                {sending ? <div className="spinner" /> : <Send size={14} />}
                {sending ? 'Sending...' : msgType === 'EMERGENCY_ALERT' ? 'Send Alert' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Message threads */}
          <div className="card" style={{ flex: 1 }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '14px' }}>Your Messages</h2>
            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}><div className="spinner" /></div> : messages.length === 0 ? (
              <div className="empty-state"><MessageSquare size={32} style={{ opacity: 0.3 }} /><div className="empty-state-title">No messages yet</div></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {messages.map(m => (
                  <div key={m.id} onClick={() => setSelectedThread(m)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${selectedThread?.id === m.id ? 'var(--accent)' : 'var(--border-subtle)'}`, background: selectedThread?.id === m.id ? 'var(--accent-subtle)' : 'var(--bg-overlay)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className={`badge ${m.type === 'EMERGENCY_ALERT' ? 'badge-red' : 'badge-blue'}`} style={{ fontSize: '10px' }}>{m.type === 'EMERGENCY_ALERT' ? '🚨 Alert' : 'Message'}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{m.content}</div>
                    {m.replies && m.replies.length > 0 && <div style={{ fontSize: '11px', color: 'var(--green)', marginTop: '6px' }}>✓ {m.replies.length} reply from admin</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Thread view */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          {!selectedThread ? (
            <div className="empty-state" style={{ flex: 1 }}>
              <MessageSquare size={40} style={{ opacity: 0.3 }} />
              <div className="empty-state-title">Select a message</div>
              <div className="empty-state-desc">Click a message on the left to view the conversation</div>
            </div>
          ) : (
            <>
              <div style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
                <span className={`badge ${selectedThread.type === 'EMERGENCY_ALERT' ? 'badge-red' : 'badge-blue'}`}>{selectedThread.type === 'EMERGENCY_ALERT' ? '🚨 Emergency Alert' : 'Message'}</span>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(selectedThread.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Original message */}
                <div style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
                  <div style={{ background: 'var(--accent)', borderRadius: '12px 12px 4px 12px', padding: '12px 16px', color: '#fff', fontSize: '14px' }}>{selectedThread.content}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>You · {formatDistanceToNow(new Date(selectedThread.createdAt), { addSuffix: true })}</div>
                </div>
                {/* Replies */}
                {selectedThread.replies?.map(r => (
                  <div key={r.id} style={{ alignSelf: r.sender.role === 'ADMIN' ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
                    <div style={{ background: r.sender.role === 'ADMIN' ? 'var(--bg-overlay)' : 'var(--accent)', borderRadius: r.sender.role === 'ADMIN' ? '12px 12px 12px 4px' : '12px 12px 4px 12px', padding: '12px 16px', fontSize: '14px', border: r.sender.role === 'ADMIN' ? '1px solid var(--border)' : 'none', color: r.sender.role === 'ADMIN' ? 'var(--text-primary)' : '#fff' }}>{r.content}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: r.sender.role === 'ADMIN' ? 'left' : 'right', marginTop: '4px' }}>{r.sender.name} · {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</div>
                  </div>
                ))}
              </div>
              {/* Reply input (only if admin has replied) */}
              {selectedThread.replies && selectedThread.replies.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                  <input className="input" placeholder="Continue the conversation..." value={replyContent} onChange={e => setReplyContent(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(selectedThread.id); } }} />
                  <button className="btn btn-primary" onClick={() => sendReply(selectedThread.id)} disabled={sending || !replyContent.trim()}><Send size={14} /></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
