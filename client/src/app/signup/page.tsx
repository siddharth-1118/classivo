"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Extracted from form inputs
    const payload = {
      email: (e.target as any).email.value,
      password: (e.target as any).password.value,
      role: 'STUDENT',
      profile: {
        fullName: (e.target as any).fullName.value,
        rollNumber: (e.target as any).rollNumber.value,
        deptId: 1, // Placeholder
        classId: 1, // Placeholder
        phone: (e.target as any).phone?.value
      }
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Signup failed');
      
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 max-w-md w-full">
           <div className="text-6xl mb-6">🎉</div>
           <h2 className="text-2xl font-black text-slate-900">Account Created!</h2>
           <p className="text-slate-500 mt-2 font-bold">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl shadow-blue-100 p-10 border border-slate-100">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Join the Platform</h1>
          <p className="text-slate-500 mt-2 font-medium">Create your student profile today</p>
          
          {error && <p className="mt-4 text-red-500 font-bold text-sm bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input name="fullName" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Roll Number</label>
            <input name="rollNumber" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none" placeholder="RA201100..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input name="email" type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none" placeholder="name@college.edu" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input name="password" type="password" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none" placeholder="••••••••" />
          </div>
          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Phone (Optional)</label>
             <input name="phone" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none" placeholder="+91..." />
          </div>
          <div className="md:col-span-2">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">
              Initialize Student Profile
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-slate-600 font-medium">
          Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
