import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      setErr(error.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-8 w-96 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Login</h2>
        {err && <div className="text-red-500">{err}</div>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border px-3 py-2 rounded"/>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="border px-3 py-2 rounded"/>
        <button type="submit" className="bg-blue-600 text-white rounded px-5 py-2">Login</button>
      </form>
    </div>
  );
}