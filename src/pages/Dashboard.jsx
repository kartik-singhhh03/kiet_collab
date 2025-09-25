import React, { useEffect, useMemo, useState } from 'react';
import Radar from '../components/Radar';
import { createSocket } from '../socket';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'kiet_token';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [presence, setPresence] = useState({});

  const token = useMemo(() => localStorage.getItem(TOKEN_KEY) || '', []);

  useEffect(() => {
    if (!token) return;
    // fetch example search
    fetch(`${API}/api/users/search?skills=react,node`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Failed to load users');
        setUsers(data);
      })
      .catch((e) => console.error(e));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = createSocket(token);
    socket.on('connect', () => console.log('socket connected'));
    socket.on('presence:update', (p) => {
      console.log('presence:update', p);
      setPresence((prev) => ({ ...prev, [p.userId]: p.status }));
    });
    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Dashboard</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Users on radar: {users.length}</p>
      <Radar users={users} presenceMap={presence} />
    </div>
  );
}
