import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import axios from 'axios';

export default function EmergencyAlertPage() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [ok, setOk] = useState(false);

  async function sendAlert(e) {
    e.preventDefault();
    await axios.post('/api/notifications', {
      userId: user.userId,
      type: 'EMERGENCY_ALERT',
      message: text
    });
    setOk(true);
    setText('');
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-6">Send Emergency Alert</h1>
      <form onSubmit={sendAlert} className="flex gap-2 mb-4">
        <input className="border px-2 py-1 flex-1" value={text} onChange={e => setText(e.target.value)} placeholder="Enter your alert..." />
        <button className="bg-red-600 text-white px-4 py-1 rounded" type="submit">Send Alert</button>
      </form>
      {ok && <div className="text-green-500">Alert sent!</div>}
    </Layout>
  );
}