import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function SignupPage() {
  const [fields, setFields] = useState({
    name: '', rollNumber: '', departmentId: '', semester: '', classId: '',
    email: '', phone: '', password: ''
  });
  const [err, setErr] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      await axios.post('/api/auth/signup', { ...fields, role: 'STUDENT' });
      router.push('/login');
    } catch (error) {
      setErr(error.response?.data?.error || 'Signup failed');
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-8 w-96 flex flex-col gap-3">
        <h2 className="text-xl font-bold">Student Signup</h2>
        {err && <div className="text-red-500">{err}</div>}
        <input required placeholder="Name" value={fields.name} onChange={e => setFields({...fields, name: e.target.value})} className="border px-3 py-2 rounded"/>
        <input required placeholder="Roll Number" value={fields.rollNumber} onChange={e => setFields({...fields, rollNumber: e.target.value})} className="border px-3 py-2 rounded"/>
        <input required placeholder="Department ID" value={fields.departmentId} onChange={e => setFields({...fields, departmentId: e.target.value})} className="border px-3 py-2 rounded"/>
        <input required placeholder="Semester" type="number" min="1" max="10" value={fields.semester} onChange={e => setFields({...fields, semester: e.target.value})} className="border px-3 py-2 rounded"/>
        <input required placeholder="Class ID" value={fields.classId} onChange={e => setFields({...fields, classId: e.target.value})} className="border px-3 py-2 rounded"/>
        <input required type="email" placeholder="Email" value={fields.email} onChange={e => setFields({...fields, email: e.target.value})} className="border px-3 py-2 rounded" />
        <input required placeholder="Phone" value={fields.phone} onChange={e => setFields({...fields, phone: e.target.value})} className="border px-3 py-2 rounded"/>
        <input required type="password" placeholder="Password" value={fields.password} onChange={e => setFields({...fields, password: e.target.value})} className="border px-3 py-2 rounded"/>
        <button type="submit" className="bg-blue-600 text-white rounded px-5 py-2">Signup</button>
      </form>
    </div>
  );
}