"use client";

import { useState } from 'react';
import { apiService } from '@/services/api';

export default function AINotesPage() {
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setLoading(true);

    try {
      const data = await apiService.post('/ai/summarize', { content });
      setSummary(data.result);
    } catch (error) {
      alert("Summarization failed. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Notes Summarizer</h1>
        <p className="text-slate-500 font-bold mt-2">Transform long lectures and PDFs into concise study guides.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm flex flex-col h-[600px]">
          <h3 className="text-xl font-black text-slate-900 mb-6 font-bold flex items-center gap-3">
            <span className="text-2xl">📝</span> Input Content
          </h3>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 w-full bg-slate-50 rounded-[24px] p-6 border border-slate-100 outline-none focus:ring-4 focus:ring-blue-50 font-medium text-slate-800 resize-none leading-relaxed"
            placeholder="Paste your notes here..."
          />
          <button 
            onClick={handleSummarize}
            disabled={loading || !content}
            className="mt-6 w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Analyzing with AI...' : 'Generate AI Summary'}
          </button>
        </section>

        <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm overflow-y-auto h-[600px] relative">
          <h3 className="text-xl font-black text-slate-900 mb-6 font-bold flex items-center gap-3">
            <span className="text-2xl">✨</span> AI Insights
          </h3>
          {summary ? (
            <div className="prose prose-slate max-w-none">
              <div className="p-6 bg-blue-50/50 rounded-[24px] border border-blue-100 text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="text-6xl mb-4">🔮</div>
              <p className="text-lg font-bold text-slate-400">Your AI-generated summary will appear here.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
