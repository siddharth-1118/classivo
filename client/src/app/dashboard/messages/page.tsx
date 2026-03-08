"use client";

const suggestedContacts = [
  { name: 'Admin Office', role: 'Department Head' },
  { name: 'John Doe', role: 'Class Volunteer' },
  { name: 'Sarah Smith', role: 'Lab Assistant' }
];

import DashboardLayout from '@/components/DashboardLayout';

export default function MessagesPage() {
  return (
    <DashboardLayout title="Messages" subtitle="Communication channel with volunteers and administration">
      <div className="h-[calc(100vh-280px)] flex flex-col items-center justify-center text-center space-y-8 bg-white border border-slate-50 rounded-[40px]">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-5xl">
          💬
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">No active conversations</h2>
          <p className="text-slate-400 font-bold mt-2">Your inbox is empty. Start a conversation with a volunteer.</p>
        </div>
        <div className="flex gap-3">
          {suggestedContacts.map(c => (
            <button key={c.name} className="px-6 py-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-2xl border border-slate-100 font-bold text-sm text-slate-500 transition-all">
              Message {c.name}
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
