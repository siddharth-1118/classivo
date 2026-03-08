import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      axios.get(`/api/students/${user.userId}`)
        .then(res => setProfile(res.data));
    }
  }, [user]);

  if (!profile) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow p-8 rounded">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      <div>
        <div><strong>Name:</strong> {profile.name}</div>
        <div><strong>Roll Number:</strong> {profile.rollNumber}</div>
        <div><strong>Department:</strong> {profile.department.name}</div>
        <div><strong>Semester:</strong> {profile.semester}</div>
        <div><strong>Class:</strong> {profile.class.name}</div>
        <div><strong>Email:</strong> {profile.email}</div>
        <div><strong>Phone:</strong> {profile.phone}</div>
      </div>
    </div>
  );
}