import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="p-12 bg-white shadow rounded flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to Classivo</h1>
        <Link href="/login" className="mb-2 px-6 py-2 bg-blue-600 text-white rounded">Login</Link>
        <Link href="/signup" className="px-6 py-2 bg-gray-800 text-white rounded">Signup as Student</Link>
      </div>
    </div>
  );
}