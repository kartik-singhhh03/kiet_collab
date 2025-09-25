import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      window.location.href = '/dashboard';
    } catch (e) {
      // handled by hook error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <form onSubmit={onSubmit} className="w-full max-w-sm border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Login</h1>
        {error && <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>}
        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">Email</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required className="w-full mb-4 px-3 py-2 border rounded-md bg-transparent text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100" placeholder="you@kiet.edu" />
        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">Password</label>
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required className="w-full mb-6 px-3 py-2 border rounded-md bg-transparent text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100" placeholder="••••••••" />
        <button disabled={loading} className="w-full py-2 bg-black text-white dark:bg-white dark:text-black rounded-md disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
        <p className="mt-4 text-xs text-gray-500">API: {API_URL}</p>
      </form>
    </div>
  );
}
