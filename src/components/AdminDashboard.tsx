import React, { useEffect, useState } from 'react';

interface Metrics { users: number; events: number; projects: number; posts: number }

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API}/api/admin/metrics`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Failed to load metrics');
        setMetrics(data);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">Admin Dashboard</h2>
      {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}
      {metrics ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics).map(([k, v]) => (
            <div key={k} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-[0_0_12px_rgba(234,179,8,0.15)]">
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{k}</p>
              <p className="text-2xl font-bold text-black dark:text-white">{v}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">Loading metrics...</p>
      )}
    </div>
  );
}
