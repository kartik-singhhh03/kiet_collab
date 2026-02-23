import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import { LoginPage, SignupPage, UserObj } from './pages/AuthPages';
import StudentDashboard from './pages/StudentDashboard';
import './landing.css';

type Page = 'landing' | 'login' | 'signup';
type User = UserObj;

/* ═══════════════════════════════════════════════════
   ROOT APP — clean, minimal routing via state
═══════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState<Page>('landing');

  /* Restore session */
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try { setUser(JSON.parse(userData)); }
      catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setPage('landing');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setPage('landing');
  };

  /* Loading screen */
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#F3F3F3', fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 38, height: 38, margin: '0 auto 1rem',
            border: '2.5px solid rgba(40,41,44,0.12)',
            borderTop: '2.5px solid #28292C',
            borderRadius: '50%', animation: 'spin 0.9s linear infinite',
          }} />
          <p style={{ color: '#96979A', fontSize: '0.85rem' }}>Loading KIET Collab…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Authenticated ── */
  if (user) {
    return (
      <StudentDashboard
        user={{ ...user, branch: (user as UserObj & { branch?: string }).branch, year: (user as UserObj & { year?: number }).year }}
        onLogout={handleLogout}
      />
    );
  }

  /* ── Auth pages ── */
  if (page === 'login') {
    return (
      <LoginPage
        onSuccess={handleAuthSuccess}
        onGoSignup={() => setPage('signup')}
        onGoLanding={() => setPage('landing')}
      />
    );
  }

  if (page === 'signup') {
    return (
      <SignupPage
        onSuccess={handleAuthSuccess}
        onGoLogin={() => setPage('login')}
        onGoLanding={() => setPage('landing')}
      />
    );
  }

  /* ── Landing (default) ── */
  return (
    <LandingPage
      setShowAuth={(show) => {
        if (show) setPage('login');
      }}
    />
  );
}
