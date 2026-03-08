import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function FilesPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      axios.get(`/api/files?classId=${user.classId}`)
        .then(res => setFiles(res.data || []));
    }
  }, [user, subject]);

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-6">Study Materials</h1>
      <div>
        <label>
          Filter by subject:
          <input value={subject} onChange={e => setSubject(e.target.value)} className="ml-2 border px-2 py-1" />
        </label>
      </div>
      {files.length === 0 ? (
        <div>No study materials uploaded yet.</div>
      ) : (
        <ul>
          {files.filter(f => !subject || f.subject.name.includes(subject)).map(file => (
            <li key={file.id} className="my-2 p-2 border rounded">
              <div className="font-semibold">{file.title}</div>
              <div>{file.description}</div>
              <a href={file.url} download className="text-blue-600 underline">Download</a>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}