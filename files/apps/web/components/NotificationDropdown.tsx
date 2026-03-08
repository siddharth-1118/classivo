import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get(`/api/notifications?userId=${user.userId}`)
        .then(res => setNotifications(res.data || []));
    }
  }, [user]);

  return (
    <div className="relative">
      <button className="relative" onClick={() => setOpen(x => !x)}>
        <span className="material-icons">notifications</span>
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="absolute top-0 right-0 rounded-full bg-red-500 text-xs text-white px-2 py-0.5">
            {notifications.filter(n => !n.read).length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded z-40">
          <div className="p-4 font-semibold border-b">Notifications</div>
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500">No notifications available.</div>
          ) : (
            <ul>
              {notifications.map(n => (
                <li key={n.id} className={`p-3 border-b ${n.read ? 'bg-gray-100' : 'bg-white'}`}>
                  <div className="font-medium">{n.type}</div>
                  <div>{n.message}</div>
                  <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}