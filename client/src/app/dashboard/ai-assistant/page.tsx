"use client";

import { useState } from 'react';
import api from '@/lib/api';

const suggestedQuestions = [
  "Explain Big O notation with examples",
  "Summarize the laws of thermodynamics",
  "How to prepare for a database exam?",
  "What is the difference between TCP and UDP?"
];

import DashboardLayout from '@/components/DashboardLayout';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your Classivo AI Study Assistant. Ask me anything about your subjects, and I'll help you understand concepts or prepare for exams!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: input, subject: 'General' });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply || "I'm sorry, I couldn't process that right now." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please ensure the backend is running and you are logged in." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="AI Study Assistant" subtitle="Get instant explanations and exam help powered by GPT-4o">
      <div className="h-[calc(100vh-280px)] flex flex-col space-y-6">
        <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((ms, idx) => (
              <div key={idx} className={`flex ${ms.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-6 rounded-[24px] ${
                  ms.role === 'user' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-slate-50 text-slate-800 border border-slate-100'
                }`}>
                  <p className="font-medium leading-relaxed whitespace-pre-wrap">{ms.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start italic text-slate-400 font-bold animate-pulse p-6 bg-slate-50/50 rounded-2xl border border-slate-100 inline-block">
                AI is thinking...
              </div>
            )}
          </div>

          <div className="p-8 border-t border-slate-100 space-y-4">
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map(q => (
                <button 
                  key={q} 
                  suppressHydrationWarning
                  onClick={() => setInput(q)}
                  className="px-4 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-100 rounded-full text-xs font-bold text-slate-500 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex gap-4">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your coursework..."
                className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold transition-all"
              />
              <button 
                disabled={loading}
                suppressHydrationWarning
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
