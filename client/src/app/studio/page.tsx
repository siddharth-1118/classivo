import { useState, useEffect } from 'react';
import api from '@/lib/api';

import DashboardLayout from '@/components/DashboardLayout';

export default function VolunteerStudio() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/volunteer');
        setStats(res.data);
      } catch (err) {
        console.error("Volunteer stats fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout title="Volunteer Studio" subtitle={`Managing ${stats?.classLabel || 'Assigned Class'}`}>
      <div className="space-y-10">
        <header className="flex justify-between items-end">
          <div />
          <button className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold border border-red-100 hover:bg-red-600 hover:text-white transition-all">
            🚨 Send Emergency Alert
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-black text-slate-900 mb-8">Upload New Material</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">Material Title</label>
                    <input className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 font-bold transition-all" placeholder="e.g. Unit 2 Question Bank" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">Subject</label>
                    <select className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 font-bold transition-all">
                      <option>Select Subject...</option>
                      {/* Subjects should ideally be fetched from DB too */}
                    </select>
                  </div>
                </div>

                <div className="border-4 border-dashed border-slate-50 rounded-[32px] p-12 text-center group hover:border-blue-100 transition-all cursor-pointer">
                  <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">📤</div>
                  <p className="text-lg font-black text-slate-800">Choose files or drag & drop</p>
                  <p className="text-sm text-slate-400 font-bold mt-1">PDF, DOCX, ZIP (Max 50MB)</p>
                </div>

                <button className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
                  Publish to Class Library
                </button>
              </form>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-slate-900 rounded-[40px] p-8 text-white min-h-[300px]">
              <h3 className="text-xl font-bold mb-6">Recent Uploads</h3>
              <div className="text-center py-10 opacity-30">
                 <p className="text-sm font-bold">No study materials uploaded yet.</p>
              </div>
            </section>

            <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🏆</div>
              <h4 className="text-lg font-black text-slate-800">Class Volunteer</h4>
              <p className="text-sm text-slate-400 font-bold">You are currently managing {stats?.managedStudents || 0} students.</p>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
