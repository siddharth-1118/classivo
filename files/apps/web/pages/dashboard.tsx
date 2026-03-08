import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      axios.get(`/api/students/${user.userId}`).then(res => setProfile(res.data));
    }
  }, [user]);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Student Dashboard</h1>
      {profile ? (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded shadow p-4">
            <div className="font-bold">Profile</div>
            <div>Name: {profile.name}</div>
            <div>Dept: {profile.department.name}</div>
            <div>Class: {profile.class.name}</div>
            <div>Semester: {profile.semester}</div>
          </div>
          {/* Add Attendance summary, downloads, notification stats via live API here */}
        </div>
      ) : (
        <div>No profile loaded.</div>
      )}
    </Layout>
  );
}