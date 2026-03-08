"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import EditProfileModal from '@/components/EditProfileModal';
import { Settings, CheckCircle2, Clock } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setProfile(res.data);
    } catch (err) {
      console.error("Profile fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const checkEditAccess = async () => {
    try {
      const res = await api.get('/notifications');
      // Look for unread special token notification
      const hasAccess = res.data.notifications?.some(
        (n: any) => n.title === '__PROFILE_EDIT_ACCESS__' && !n.isRead
      );
      setCanEdit(!!hasAccess);
    } catch (err) {
      console.error("Failed to check edit access");
    }
  };

  useEffect(() => {
    if (!mounted) return;
    fetchProfile();
    checkEditAccess();
  }, [mounted]);

  if (!mounted) return null;

  const studentData = profile?.profile || profile?.studentProfile || {};

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your academic records and account settings">
      {loading ? (
        <div className="h-full flex items-center justify-center py-20">
          <div className="spinner" style={{ width: '40px', height: '40px' }} />
        </div>
      ) : !profile ? (
        <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
          <div className="text-6xl text-slate-200">📭</div>
          <p className="text-xl font-black text-slate-400">Profile record not found.</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
          <header className="flex flex-col items-center text-center space-y-6 relative">
            {canEdit && (
              <div className="absolute top-0 right-0">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="btn btn-primary btn-sm rounded-full"
                  title="Edit Profile"
                >
                  <Settings size={14} />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
            <div className="w-32 h-32 bg-blue-600 rounded-[48px] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-500/20 relative group">
               {profile.name?.charAt(0) || 'U'}
               <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white">
                 <CheckCircle2 size={20} />
               </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-200 tracking-tight">{profile.name}</h1>
              <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">
                Verified Student ID: <span className="text-accent">{studentData.rollNumber || 'Pending'}</span>
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <section className="card bg-surface p-10 rounded-[48px] border border-border-subtle shadow-sm space-y-8">
               <h3 className="text-xl font-black text-slate-200 border-b border-border-subtle pb-4 flex items-center gap-2">
                 Academic Context
               </h3>
               <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Class / Batch</p>
                    <p className="text-lg font-bold text-slate-300">{studentData.class?.name || 'Not Assigned'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Department</p>
                    <p className="text-lg font-bold text-slate-300">{studentData.department?.name || 'General'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Semester</p>
                    <span className="badge badge-purple mt-1">Semester {studentData.semester || 'N/A'}</span>
                  </div>
               </div>
            </section>

            <section className="card bg-surface p-10 rounded-[48px] border border-border-subtle shadow-sm space-y-8">
               <h3 className="text-xl font-black text-slate-200 border-b border-border-subtle pb-4">Account Status</h3>
               <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verification Status</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-block px-4 py-1 rounded-full text-xs font-black ${!canEdit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {!canEdit ? 'LOCKED (VERIFIED)' : 'EDIT MODE ENABLED'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enrollment Date</p>
                    <p className="text-lg font-bold text-slate-300 flex items-center gap-2">
                      <Clock size={16} className="text-slate-500" />
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Information</p>
                    <p className="text-lg font-bold text-slate-300 mt-1">{profile.email}</p>
                    <p className="text-sm font-medium text-slate-500">{profile.phone || 'No phone provided'}</p>
                  </div>
               </div>
            </section>
          </div>
        </div>
      )}

      {showEditModal && (
        <EditProfileModal 
          profile={profile} 
          onClose={() => setShowEditModal(false)} 
          onSuccess={(updated) => {
            fetchProfile(); // Refresh profile
            setCanEdit(false); // Revoke edit access locally immediately
          }}
        />
      )}
    </DashboardLayout>
  );
}
