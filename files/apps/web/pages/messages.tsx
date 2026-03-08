import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    axios.get(`/api/messages?userId=${user.userId}`).then(res => setMessages(res.data));
  }, [user]);

  async function sendMessage(e) {
    e.preventDefault();
    await axios.post('/api/messages', {
      senderId: user.userId,
      recipientRole: 'ADMIN',
      text
    });
    setText('');
    axios.get(`/api/messages?userId=${user.userId}`).then(res => setMessages(res.data));
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-6">Your Messages</h1>
      <form onSubmit={sendMessage} className="flex gap-2 mb-4">
        <input className="border px-2 py-1 flex-1" value={text} onChange={e => setText(e.target.value)} placeholder="Type your message..." />
        <button className="bg-blue-500 text-white px-4 py-1 rounded" type="submit">Send</button>
      </form>
      {messages.length === 0 ? (
        <div>No messages yet.</div>
      ) : (
        <ul>
          {messages.map(m => (
            <li key={m.id} className="border-b py-2">
              <span className="font-semibold">{m.sender.name}</span>
              : {m.text}
              {m.replyTo && <div className="text-sm ml-4 text-gray-600">Reply: {m.replyTo}</div>}
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}