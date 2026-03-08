import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminFilesPage() {
  const [files, setFiles] = useState([]);
  useEffect(() => {
    axios.get('/api/admin/files').then(res => setFiles(res.data));
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this file?')) return;
    await axios.delete(`/api/files/${id}`);
    setFiles(files.filter(f => f.id !== id));
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-6">Manage Uploaded Files</h1>
      {files.length === 0 ? (
        <div>No study materials uploaded yet.</div>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th>Title</th><th>Subject</th><th>Class</th><th>Uploaded By</th><th>Download</th><th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id}>
                <td>{file.title}</td>
                <td>{file.subject?.name}</td>
                <td>{file.class?.name}</td>
                <td>{file.uploadedBy?.name}</td>
                <td>
                  <a href={file.url} download className="text-blue-600 underline">Download</a>
                </td>
                <td>
                  <button onClick={() => handleDelete(file.id)} className="text-red-500 underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}