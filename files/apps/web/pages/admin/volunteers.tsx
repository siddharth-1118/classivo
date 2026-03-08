import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  useEffect(() => {
    axios.get('/api/admin/volunteers').then(res => setVolunteers(res.data));
  }, []);
  return (
    <Layout>
      <h1 className="text-xl font-bold mb-6">Manage Volunteers</h1>
      {volunteers.length === 0 ? (
        <div>No volunteers added yet.</div>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th>Name</th><th>Class</th><th>Department</th><th>Email</th><th>Active</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map(v => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.class.name}</td>
                <td>{v.department.name}</td>
                <td>{v.email}</td>
                <td>{v.active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}