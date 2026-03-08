import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import axios from 'axios';

export default function VolunteerUpload() {
  const { user } = useAuth();
  const [fields, setFields] = useState({
    title: '', description: '', category: 'NOTES', departmentId: '', classId: '', subjectId: '', file: null
  });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(''); setOk(false);

    const formData = new FormData();
    Object.entries(fields).forEach(([key, val]) => key === 'file' ? formData.append('file', val) : formData.append(key, val));
    try {
      await axios.post('/api/files/upload', formData, { headers: { Authorization: `Bearer ${user.token}` } });
      setOk(true);
      setFields({ ...fields, title: '', description: '', file: null });
    } catch (error) {
      setErr(error.response?.data?.error || 'Upload failed');
    }
  }
  return (
    <Layout>
      <h1 className="text-xl font-bold mb-6">Volunteer File Upload</h1>
      {ok && <div className="text-green-500 mb-2">Upload successful!</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
        <input required placeholder="Title" value={fields.title} onChange={e => setFields({ ...fields, title: e.target.value })} className="border px-2 py-1 rounded"/>
        <input required placeholder="Description" value={fields.description} onChange={e => setFields({ ...fields, description: e.target.value })} className="border px-2 py-1 rounded"/>
        <select value={fields.category} onChange={e => setFields({ ...fields, category: e.target.value })} className="border px-2 py-1 rounded">
          <option value="NOTES">Notes</option>
          <option value="QUESTION_PAPER">Question Paper</option>
          <option value="ASSIGNMENT">Assignment</option>
          <option value="STUDY_MATERIAL">Study Material</option>
        </select>
        <input required placeholder="Department ID" value={fields.departmentId} onChange={e => setFields({ ...fields, departmentId: e.target.value })} className="border px-2 py-1 rounded"/>
        <input required placeholder="Class ID" value={fields.classId} onChange={e => setFields({ ...fields, classId: e.target.value })} className="border px-2 py-1 rounded"/>
        <input required placeholder="Subject ID" value={fields.subjectId} onChange={e => setFields({ ...fields, subjectId: e.target.value })} className="border px-2 py-1 rounded"/>
        <input required type="file" onChange={e => setFields({ ...fields, file: e.target.files[0] })} className="border p-2 rounded"/>
        <button type="submit" className="bg-blue-600 text-white rounded px-5 py-2">Upload</button>
        {err && <div className="text-red-500">{err}</div>}
      </form>
    </Layout>
  );
}