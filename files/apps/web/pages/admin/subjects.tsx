import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [fields, setFields] = useState({ name: '', departmentId: '', classId: '' });
  useEffect(() => {
    axios.get('/api/admin/subjects').then(res => setSubjects(res.data));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    const res = await axios.post('/api/admin/subjects', fields);
    setSubjects([...subjects, res.data]);
    setFields({ name: '', departmentId: '', classId: '' });
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-6">Manage Subjects</h1>
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input value={fields.name} onChange={e => setFields({ ...fields, name: e.target.value })} className="border px-2 py-1 rounded" placeholder="Subject name" required/>
        <input value={fields.departmentId} onChange={e => setFields({ ...fields, departmentId: e.target.value })} className="border px-2 py-1 rounded" placeholder="Department ID" required/>
        <input value={fields.classId} onChange={e => setFields({ ...fields, classId: e.target.value })} className="border px-2 py-1 rounded" placeholder="Class ID" required/>
        <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded">Add</button>
      </form>
      {subjects.length === 0 ? (
        <div>No subjects created yet.</div>
      ) : (
        <ul>
          {subjects.map(subj => (
            <li key={subj.id} className="py-2 border-b">{subj.name} (Class: {subj.class?.name || subj.classId})</li>
          ))}
        </ul>
      )}
    </Layout>
  );
}