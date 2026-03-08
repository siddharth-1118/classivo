'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
  HelpCircle, Send, MessageSquare, Clock, CheckCircle2,
  ChevronDown, ChevronUp, Edit2, Bell, X, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

interface Query {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  sender: { id: string; name: string; role: string; email?: string };
  replies: Reply[];
}

interface StudentInfo {
  id: string;
  rollNumber: string;
  departmentId: string;
  classId: string;
  semester: string;
  user: { id: string; name: string; email: string; phone?: string };
  department?: { id: string; name: string };
  class?: { id: string; name: string };
}

interface Department { id: string; name: string; }
interface ClassItem { id: string; name: string; departmentId: string; }

export default function QueriesPage() {
  const { user } = useAuth();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Admin: notify student
  const [notifyQuery, setNotifyQuery] = useState<Query | null>(null);
  const [notifyMsg, setNotifyMsg] = useState('');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifySending, setNotifySending] = useState(false);

  // Admin: edit student profile
  const [editStudent, setEditStudent] = useState<StudentInfo | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', rollNumber: '', departmentId: '', classId: '', semester: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const isStudent = user?.role === 'STUDENT';
  const isStaff = user?.role === 'ADMIN' || user?.role === 'VOLUNTEER';
  const isAdmin = user?.role === 'ADMIN';

  const fetchQueries = async () => {
    try {
      const res = await api.get('/queries');
      setQueries(res.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchQueries();
    if (isAdmin) {
      api.get('/departments').then(r => setDepartments(r.data)).catch(() => {});
      api.get('/classes').then(r => setClasses(r.data)).catch(() => {});
    }
  }, []);

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await api.post('/queries', { content });
      toast.success('Query sent! Admin/volunteer will reply soon.');
      setContent(''); setShowForm(false);
      await fetchQueries();
    } catch { toast.error('Failed to send query'); } finally { setSending(false); }
  };

  const handleReply = async (queryId: string) => {
    if (!replyContent.trim()) return;
    setSending(true);
    try {
      await api.post(`/queries/${queryId}/reply`, { content: replyContent });
      toast.success('Reply sent!');
      setReplyContent(''); setReplyingTo(null);
      await fetchQueries();
    } catch { toast.error('Failed to send reply'); } finally { setSending(false); }
  };

  // Admin: notify student
  const handleNotify = async () => {
    if (!notifyQuery || !notifyMsg.trim()) return;
    setNotifySending(true);
    try {
      // Find student record by userId
      const allStudents = await api.get('/students');
      const std = allStudents.data.find((s: any) => s.userId === notifyQuery.sender.id || s.user?.id === notifyQuery.sender.id);
      if (!std) { toast.error('Student record not found'); return; }
      await api.post(`/students/${std.id}/notify`, { message: notifyMsg, title: notifyTitle || undefined });
      toast.success(`Notification sent to ${notifyQuery.sender.name}!`);
      setNotifyQuery(null); setNotifyMsg(''); setNotifyTitle('');
    } catch { toast.error('Failed to send notification'); } finally { setNotifySending(false); }
  };

  // Admin: open edit modal for student who sent the query
  const handleOpenEdit = async (q: Query) => {
    try {
      const allStudents = await api.get('/students');
      const std: StudentInfo = allStudents.data.find((s: any) => s.userId === q.sender.id || s.user?.id === q.sender.id);
      if (!std) { toast.error('Student profile not found'); return; }
      setEditStudent(std);
      setEditForm({
        name: std.user.name,
        email: std.user.email,
        phone: std.user.phone || '',
        rollNumber: std.rollNumber,
        departmentId: std.departmentId,
        classId: std.classId,
        semester: std.semester,
      });
    } catch { toast.error('Failed to load student profile'); }
  };

  const handleSaveEdit = async () => {
    if (!editStudent) return;
    setEditSaving(true);
    try {
      await api.put(`/students/${editStudent.id}`, editForm);
      toast.success('Student profile updated!');
      // Send a notification to the student about the update
      await api.post(`/students/${editStudent.id}/notify`, {
        title: 'Your profile was updated by admin',
        message: 'An administrator has updated your profile information. Please check your profile to see the changes.',
      });
      setEditStudent(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setEditSaving(false); }
  };

  const filteredClasses = classes.filter(c => !editForm.departmentId || c.departmentId === editForm.departmentId);
  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  return (
    <DashboardLayout title="Queries" subtitle={isStudent ? "Send queries to admin or volunteer" : "Manage student queries"}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {queries.length} quer{queries.length !== 1 ? 'ies' : 'y'}
            {isStaff && queries.filter(q => q.replies.length === 0).length > 0 && (
              <span style={{ marginLeft: '8px', color: 'var(--amber, #f59e0b)', fontWeight: '600' }}>
                · {queries.filter(q => q.replies.length === 0).length} pending
              </span>
            )}
          </div>
          {isStudent && (
            <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
              <HelpCircle size={15} /> Ask a Query
            </button>
          )}
        </div>

        {/* Compose form (students only) */}
        {isStudent && showForm && (
          <div className="card" style={{ border: '1px solid var(--accent)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} color="var(--accent)" /> New Query
            </h3>
            <form onSubmit={handleSendQuery} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea className="input" rows={4} placeholder="Describe your query in detail..." value={content} onChange={e => setContent(e.target.value)} required style={{ minHeight: '100px', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={sending || !content.trim()}>
                  {sending ? <div className="spinner" /> : <Send size={13} />}
                  {sending ? 'Sending...' : 'Send Query'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Query list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" style={{ width: '32px', height: '32px' }} />
          </div>
        ) : queries.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <HelpCircle size={48} style={{ opacity: 0.3 }} />
              <div className="empty-state-title">{isStudent ? 'No queries yet' : 'No student queries yet'}</div>
              <div className="empty-state-desc">{isStudent ? 'Click "Ask a Query" to send your first question' : 'Student queries will appear here'}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {queries.map(q => {
              const hasReply = q.replies.length > 0;
              const isOpen = expanded === q.id;
              return (
                <div key={q.id} className="card" style={{
                  border: `1px solid ${hasReply ? 'var(--border-subtle)' : 'var(--amber, #f59e0b)22'}`,
                  borderLeft: `3px solid ${hasReply ? 'var(--green)' : 'var(--amber, #f59e0b)'}`,
                  padding: '16px', transition: 'all 0.15s',
                }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : q.id)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {hasReply ? <CheckCircle2 size={14} color="var(--green)" /> : <Clock size={14} color="var(--amber, #f59e0b)" />}
                        <span style={{ fontSize: '11px', fontWeight: '600', color: hasReply ? 'var(--green)' : 'var(--amber, #f59e0b)' }}>
                          {hasReply ? 'ANSWERED' : 'PENDING'}
                        </span>
                        {isStaff && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· from <strong>{q.sender.name}</strong></span>}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5', paddingRight: '16px' }}>{q.content}</div>
                    </div>
                    <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                      {/* Replies */}
                      {q.replies.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                          {q.replies.map(r => (
                            <div key={r.id} style={{ background: 'var(--bg-overlay)', borderRadius: '8px', padding: '12px 14px', border: '1px solid var(--border-subtle)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent)' }}>
                                  {r.sender.name} <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>({r.sender.role})</span>
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                              </div>
                              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{r.content}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={13} /> No replies yet.
                        </div>
                      )}

                      {/* Staff actions */}
                      {isStaff && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {/* Reply box */}
                          {replyingTo === q.id ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input className="input" placeholder="Type your reply..." value={replyContent} onChange={e => setReplyContent(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleReply(q.id); }} autoFocus style={{ flex: 1 }} />
                              <button className="btn btn-primary btn-sm" onClick={() => handleReply(q.id)} disabled={sending || !replyContent.trim()}><Send size={13} /> Reply</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => { setReplyingTo(null); setReplyContent(''); }}>Cancel</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => setReplyingTo(q.id)}>
                                <MessageSquare size={13} /> Reply
                              </button>
                              {isAdmin && (
                                <>
                                  <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(q)} title="Edit this student's profile">
                                    <Edit2 size={13} /> Edit Profile
                                  </button>
                                  <button className="btn btn-ghost btn-sm" onClick={() => { setNotifyQuery(q); setNotifyTitle(`Re: your query`); }} title="Send a direct notification to this student" style={{ color: 'var(--blue)' }}>
                                    <Bell size={13} /> Message Student
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Direct Message Modal ── */}
      {notifyQuery && (
        <div className="modal-backdrop" onClick={() => setNotifyQuery(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                <Bell size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Message to {notifyQuery.sender.name}
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setNotifyQuery(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--bg-overlay)', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--text-muted)', borderLeft: '3px solid var(--accent)' }}>
                <strong>Their query:</strong> {notifyQuery.content}
              </div>
              <div className="input-group">
                <label className="input-label">Notification Title (optional)</label>
                <input className="input" placeholder="e.g. Re: your query about assignments" value={notifyTitle} onChange={e => setNotifyTitle(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Message <span style={{ color: 'var(--red)' }}>*</span></label>
                <textarea className="input" rows={4} placeholder="Type your message to the student..." value={notifyMsg} onChange={e => setNotifyMsg(e.target.value)} required style={{ minHeight: '90px', resize: 'vertical' }} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Bell size={12} /> This will appear in the student's notification bell.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setNotifyQuery(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleNotify} disabled={notifySending || !notifyMsg.trim()}>
                {notifySending ? <div className="spinner" /> : <Send size={15} />}
                {notifySending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Student Profile Modal ── */}
      {editStudent && (
        <div className="modal-backdrop" onClick={() => setEditStudent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                <Edit2 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Edit Profile — {editStudent.user.name}
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditStudent(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group"><label className="input-label">Full Name</label><input className="input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="input-group"><label className="input-label">Email</label><input className="input" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="input-group"><label className="input-label">Phone</label><input className="input" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className="input-group"><label className="input-label">Roll Number</label><input className="input" value={editForm.rollNumber} onChange={e => setEditForm(f => ({ ...f, rollNumber: e.target.value }))} /></div>
                <div className="input-group">
                  <label className="input-label">Department</label>
                  <select className="select" value={editForm.departmentId} onChange={e => setEditForm(f => ({ ...f, departmentId: e.target.value, classId: '' }))}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Class</label>
                  <select className="select" value={editForm.classId} onChange={e => setEditForm(f => ({ ...f, classId: e.target.value }))}>
                    <option value="">Select Class</option>
                    {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Semester</label>
                  <select className="select" value={editForm.semester} onChange={e => setEditForm(f => ({ ...f, semester: e.target.value }))}>
                    {semesters.map(s => <option key={s} value={s}>{s} Semester</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--bg-overlay)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Bell size={12} /> The student will receive a notification when you save changes.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditStudent(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit} disabled={editSaving}>
                {editSaving ? <div className="spinner" /> : <Check size={18} />}
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
