import { useState, useEffect } from 'react';
import axios from 'axios';

export default function VolunteerActivityModal({ volunteerId, visible, onClose }) {
  const [files, setFiles] = useState([]);
  useEffect(() => {
    if (visible && volunteerId) {
      axios.get(`/api/files?volunteerId=${volunteerId}`).then(res => setFiles(res.data));
    }
  }, [visible, volunteerId]);
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-8 w-[400px]">
        <h2 className="text-lg font-bold mb-4">Volunteer Activity</h2>
        <button className="absolute top-2 right-2 text-lg" onClick={onClose}>×</button>
        {files.length === 0 ? (
          <div>No uploads/activity yet.</div>
        ) : (
          <ul>
            {files.map(f => (
              <li key={f.id} className="border-b py-2">
                <div>{f.title}</div>
                <div className="text-xs text-gray-500">Category: {f.category}</div>
                <a href={f.url} className="underline text-blue-500" download>Download</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}