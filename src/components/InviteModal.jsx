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
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
      <div className="w-full max-w-sm card-futuristic rounded-xl p-4">
        <h3 className="text-lg font-semibold text-primary mb-2">Invite {toUser.name}</h3>
        <textarea
          className="w-full h-24 p-2 input-futuristic rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="mt-3 flex gap-2 justify-end">
          <button className="px-3 py-1 rounded btn-outline-gradient" onClick={onClose} type="button">Cancel</button>
          <button className="px-3 py-1 rounded btn-primary-gradient text-white disabled:opacity-50" disabled={loading} onClick={send} type="button">
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}
