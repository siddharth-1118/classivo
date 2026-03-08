import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [uploadType, setUploadType] = useState('MANUAL');
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      axios.get(`/api/students/${user.userId}/subjects`).then(res => setSubjects(res.data));
      axios.get(`/api/attendance/${user.userId}`).then(res => setAttendance(res.data));
    }
  }, [user]);

  function handleUpload(e) {
    e.preventDefault();
    const formData = new FormData();
    if (uploadType !== 'MANUAL') {
      formData.append('file', e.target.file.files[0]);
    }
    formData.append('studentId', user.userId);
    formData.append('subjectId', subjectId);
    formData.append('type', uploadType);
    formData.append('value', value);

    axios.post('/api/attendance/upload', formData)
      .then(() => window.location.reload());
  }

  const subjectPercentages = subjects.map(subject => {
    const att = attendance.filter(a => a.subjectId === subject.id);
    const percent = att.length ? att.reduce((sum, a) => sum + a.value, 0) / att.length : 0;
    return { subject: subject.name, percent };
  });

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-6">Upload your Attendance</h2>
      <form onSubmit={handleUpload} className="mb-6">
        <div>
          <label>Upload Type</label>
          <select value={uploadType} onChange={e => setUploadType(e.target.value)} className="ml-2 px-2 py-1 border">
            <option value="SCREENSHOT">Screenshot</option>
            <option value="PDF">PDF</option>
            <option value="MANUAL">Manual Entry</option>
          </select>
        </div>
        <div>
          <label>Subject:</label>
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="ml-2 px-2 py-1 border">
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label>Attendance %:</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)} min={0} max={100} className="ml-2 px-2 py-1 border" />
        </div>
        {uploadType !== 'MANUAL' && <input type="file" name="file" className="block mt-2" required />}
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" type="submit">Upload</button>
      </form>
      <h3 className="font-semibold text-lg mb-2">Subject-wise Attendance</h3>
      <div className="grid grid-cols-2 gap-4">
        {subjectPercentages.length === 0 ? (
          <div>No attendance records found.</div>
        ) : subjectPercentages.map(sp => (
          <div key={sp.subject} className="p-2 border rounded shadow">
            <div>{sp.subject}</div>
            <div>{sp.percent.toFixed(2)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}