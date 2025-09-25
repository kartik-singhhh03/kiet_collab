import React, { useState } from 'react';

const TOKEN_KEY = 'kiet_token';
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function InviteModal({ toUser, onClose, onSent }) {
  const [message, setMessage] = useState('Hey! Want to collaborate?');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem(TOKEN_KEY) || '';

  const send = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ toUserId: toUser._id, message })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invite');
      if (onSent) onSent(data);
      onClose();
      // simple toast
      alert('Invite sent');
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-sm bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Invite {toUser.name}</h3>
        <textarea
          className="w-full h-24 p-2 border border-gray-300 dark:border-gray-700 rounded bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="mt-3 flex gap-2 justify-end">
          <button className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700" onClick={onClose} type="button">Cancel</button>
          <button className="px-3 py-1 rounded bg-black text-white dark:bg-white dark:text-black disabled:opacity-50" disabled={loading} onClick={send} type="button">
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}
