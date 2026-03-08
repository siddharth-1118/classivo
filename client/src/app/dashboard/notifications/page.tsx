"use client";

import DashboardLayout from '@/components/DashboardLayout';

export default function NotificationsPage() {
  return (
    <DashboardLayout title="Notifications" subtitle="Stay updated with the latest campus alerts and resource uploads">
      <div className="h-[calc(100vh-280px)] flex flex-col items-center justify-center text-center space-y-6 bg-white border border-slate-50 rounded-[40px]">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-5xl">
          🔔
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">All caught up!</h2>
          <p className="text-slate-400 font-bold mt-2">You have no new notifications at the moment.</p>
        </div>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
          View History
        </button>
      </div>
    </DashboardLayout>
  );
}
