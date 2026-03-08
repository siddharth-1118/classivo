import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios.get(`/api/notifications?userId=${user.userId}`).then(res => setNotifications(res.data));
  }, [user]);

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-6">Notifications</h1>
      {notifications.length === 0 ? (
        <div>No notifications available.</div>
      ) : (
        <ul>
          {notifications.map(n => (
            <li key={n.id} className="border-b py-2">
              <div><span className="font-semibold">{n.type}</span> — {n.message}</div>
              <div className="text-gray-400 text-xs">{new Date(n.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}