"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';

import DashboardLayout from '@/components/DashboardLayout';

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (subject) query.append('subject', subject);
        const res = await api.get(`/resources/files?${query.toString()}`);
        setFiles(res.data);
      } catch (err) {
        console.error("Failed to fetch files");
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [subject]);

  const filteredFiles = files.filter(f => 
    f.title.toLowerCase().includes(search.toLowerCase()) || 
    f.subject?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Resource Library" subtitle="Class-specific academic materials uploaded by volunteers">
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto ml-auto">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Filter by subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 font-bold text-slate-600 transition-all w-full md:w-48"
              />
              {subject && (
                <button onClick={() => setSubject('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">✕</button>
              )}
            </div>
            <input 
              type="text" 
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 font-bold text-slate-600 transition-all w-full md:w-64"
            />
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[1,2,3].map(i => (
              <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[32px] border border-slate-100"></div>
            ))}
          </div>
        ) : filteredFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12">
            {filteredFiles.map((file) => (
              <div key={file.id} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all group border-b-4 border-b-transparent hover:border-b-blue-600">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                    📄
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{file.title}</h3>
                <p className="text-slate-400 text-sm font-bold mb-6">{file.subject?.name} • {file.category}</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <span className="text-xs font-bold text-slate-300">{new Date(file.createdAt).toLocaleDateString()}</span>
                  <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] border border-slate-50">
             <div className="text-6xl mb-6 opacity-20">📂</div>
             <p className="text-xl font-black text-slate-300 uppercase letter-spacing-widest">No study materials uploaded yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
