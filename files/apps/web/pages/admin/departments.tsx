import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  useEffect(() => {
    axios.get('/api/admin/departments').then(res => setDepartments(res.data));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    const res = await axios.post('/api/admin/departments', { name });
    setDepartments([...departments, res.data]);
    setName('');
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-6">Manage Departments</h1>
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} className="border px-2 py-1 rounded" placeholder="Department name" required/>
        <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded">Add</button>
      </form>
      {departments.length === 0 ? (
        <div>No departments created yet.</div>
      ) : (
        <ul>
          {departments.map(dep => (
            <li key={dep.id} className="py-2 border-b">{dep.name}</li>
          ))}
        </ul>
      )}
    </Layout>
  );
}