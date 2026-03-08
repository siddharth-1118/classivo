"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';

import DashboardLayout from '@/components/DashboardLayout';

export default function AttendancePage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance/me');
        // Backend returns { records, summary, overallAvg, threshold }
        setSubjects(res.data.summary || []);
      } catch (err) {
        console.error("Failed to fetch attendance");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <DashboardLayout title="Attendance Tracking" subtitle="Subject-wise attendance and portal sync statistics">
      <div className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
              <h3 className="text-xl font-black text-slate-900 mb-8">Subject-wise Statistics</h3>
              
              {loading ? (
                <div className="space-y-6">
                   {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl"></div>)}
                </div>
              ) : subjects.length > 0 ? (
                <div className="space-y-6">
                  {subjects.map((sub) => (
                    <div key={sub.id} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="font-bold text-slate-800">{sub.subjectName || sub.subject?.name}</h4>
                          <p className="text-xs text-slate-400 font-bold">Latest Update: {new Date(sub.updatedAt || new Date()).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-sm font-black ${
                          sub.percentage >= 75 ? 'text-blue-600' : 'text-amber-600'
                        }`}>{sub.percentage}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            sub.percentage >= 75 ? 'bg-blue-600' : 'bg-amber-500'
                          }`} 
                          style={{ width: `${sub.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="text-5xl mb-4 opacity-20">📊</div>
                  <p className="font-black text-slate-300 uppercase tracking-widest">No attendance records found.</p>
                  <p className="text-slate-400 text-sm font-bold mt-2">Upload your first record to begin tracking.</p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6">Portal Sync</h3>
              <div className="space-y-4">
                <button className="w-full p-6 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center gap-3 group hover:bg-blue-100/50 transition-all">
                  <span className="text-3xl group-hover:scale-110 transition-transform">🖼️</span>
                  <p className="font-bold text-blue-700">Upload Screenshot</p>
                  <p className="text-xs text-blue-400 font-semibold text-center">Drag Academia portal screenshot here</p>
                </button>
                
                <button className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-600 hover:bg-slate-100">
                  📄 Upload PDF Portal Data
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
