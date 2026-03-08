"use client";
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export default function AdminConsole() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.get('/dashboard/admin');
        setStats(data);
      } catch (err) {
        console.error("Admin stats fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const metrics = [
    { label: 'Total Students', value: stats?.totalStudents?.toLocaleString() || '0', change: 'Live', color: 'blue' },
    { label: 'Active Volunteers', value: stats?.activeVolunteers?.toLocaleString() || '0', change: 'Stable', color: 'indigo' },
    { label: 'Total Files', value: stats?.filesUploaded?.toLocaleString() || '0', change: 'Verified', color: 'emerald' },
    { label: 'Avg. Attendance', value: stats?.attendanceAverage || '0%', change: 'Calculated', color: 'amber' },
  ];

  if (loading) {
     return (
       <div className="h-full flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
       </div>
     );
  }

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Oversight</h1>
          <p className="text-slate-500 font-bold mt-2">Global administration and analytics dashboard.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
            <h3 className="text-4xl font-black text-slate-900 mt-3">{m.value}</h3>
            <p className="text-xs font-bold mt-4 text-slate-400">
              {m.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900 mb-10">Recent Notifications</h3>
          <div className="text-center py-20 opacity-30">
             <p className="text-lg font-black text-slate-400">No notifications available.</p>
          </div>
        </section>

        <section className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900 mb-10">User Activity Stream</h3>
          <div className="text-center py-20 opacity-30">
             <p className="text-lg font-black text-slate-400">No recent activity detected.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
