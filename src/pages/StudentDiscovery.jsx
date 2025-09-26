import React, { useEffect, useMemo, useState } from 'react';
import StudentProfileCard from '../components/StudentProfileCard';
import RadarSearch from '../components/RadarSearch';
import { createSocket } from '../socket';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'kiet_token';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'MBA', 'MCA'];
const YEARS = [1, 2, 3, 4];

export default function StudentDiscovery({ isDark, toggleTheme, user }) {
  const token = useMemo(() => localStorage.getItem(TOKEN_KEY) || '', []);
  const [skillsInput, setSkillsInput] = useState('react,node');
  const [availability, setAvailability] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [view, setView] = useState('card');
  const [results, setResults] = useState([]);
  const [presence, setPresence] = useState({});

  useEffect(() => {
    if (!token) return;
    const socket = createSocket(token);
    socket.on('presence:update', (p) => {
      setPresence((prev) => ({ ...prev, [p.userId]: p.status }));
    });
    return () => socket.disconnect();
  }, [token]);

  const fetchResults = async () => {
    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const params = new URLSearchParams();
    if (skills.length) params.set('skills', skills.join(','));
    if (availability) params.set('availability', availability);
    try {
      const res = await fetch(`${API}/api/users/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      // Client filter by branch/year if present
      const filtered = data.filter((u) => {
        const okBranch = branch ? (u.branch || u.department) === branch : true;
        const okYear = year ? String(u.year) === String(year) : true;
        return okBranch && okYear;
      });
      setResults(filtered);
    } catch (e) {
      console.error(e);
      setResults([]);
    }
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-futuristic-dark' : 'bg-futuristic-light'}`}>
      <nav className="sticky top-0 z-40 nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="text-sm text-primary font-medium">Student Discovery</div>
          <button onClick={toggleTheme} className="text-xs px-2 py-1 card-futuristic rounded">Toggle Theme</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters */}
        <aside className="md:col-span-1 space-y-4">
          <div className="card-futuristic rounded-lg p-4">
            <label className="block text-sm text-primary mb-1">Skills (comma-separated)</label>
            <input value={skillsInput} onChange={(e)=>setSkillsInput(e.target.value)} className="w-full px-3 py-2 input-futuristic rounded" placeholder="react,node,ui" />
          </div>
          <div className="card-futuristic rounded-lg p-4">
            <label className="block text-sm text-primary mb-1">Branch</label>
            <select value={branch} onChange={(e)=>setBranch(e.target.value)} className="w-full px-3 py-2 input-futuristic rounded">
              <option value="">Any</option>
              {BRANCHES.map((b)=> <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="card-futuristic rounded-lg p-4">
            <label className="block text-sm text-primary mb-1">Year</label>
            <select value={year} onChange={(e)=>setYear(e.target.value)} className="w-full px-3 py-2 input-futuristic rounded">
              <option value="">Any</option>
              {YEARS.map((y)=> <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="card-futuristic rounded-lg p-4">
            <label className="block text-sm text-primary mb-1">Availability</label>
            <select value={availability} onChange={(e)=>setAvailability(e.target.value)} className="w-full px-3 py-2 input-futuristic rounded">
              <option value="">Any</option>
              <option value="available">Open to Collaborate</option>
              <option value="busy">Busy</option>
              <option value="away">Looking for Team</option>
            </select>
          </div>
          <button onClick={fetchResults} className="w-full py-2 rounded btn-primary-gradient text-white">Search</button>
        </aside>

        {/* Results */}
        <main className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Results</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-secondary">View:</span>
              <button onClick={()=>setView('card')} className={`px-2 py-1 rounded ${view==='card'?'btn-primary-gradient text-white':'btn-outline-gradient'}`}>Card</button>
              <button onClick={()=>setView('radar')} className={`px-2 py-1 rounded ${view==='radar'?'btn-primary-gradient text-white':'btn-outline-gradient'}`}>Radar</button>
            </div>
          </div>

          {view === 'card' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((u)=> (
                <StudentProfileCard key={u._id || u.email} user={u} onView={()=>{}} />
              ))}
            </div>
          ) : (
            <RadarSearch users={results} presenceMap={presence} requestedSkills={skillsInput} onBlipClick={(u)=>{}} />
          )}
        </main>
      </div>
    </div>
  );
}
