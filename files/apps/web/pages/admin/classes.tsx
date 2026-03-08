import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState([]);
  const [fields, setFields] = useState({ name: '', departmentId: '' });
  useEffect(() => {
    axios.get('/api/admin/classes').then(res => setClasses(res.data));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    const res = await axios.post('/api/admin/classes', fields);
    setClasses([...classes, res.data]);
    setFields({ name: '', departmentId: '' });
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-6">Manage Classes</h1>
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input value={fields.name} onChange={e => setFields({ ...fields, name: e.target.value })} className="border px-2 py-1 rounded" placeholder="Class name" required/>
        <input value={fields.departmentId} onChange={e => setFields({ ...fields, departmentId: e.target.value })} className="border px-2 py-1 rounded" placeholder="Department ID" required/>
        <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded">Add</button>
      </form>
      {classes.length === 0 ? (
        <div>No classes created yet.</div>
      ) : (
        <ul>
          {classes.map(cls => (
            <li key={cls.id} className="py-2 border-b">{cls.name} (Dept: {cls.department?.name || cls.departmentId})</li>
          ))}
        </ul>
      )}
    </Layout>
  );
}