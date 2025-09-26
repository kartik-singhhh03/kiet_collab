import React, { useState, useEffect } from 'react';
import { Moon, Sun, Users, Calendar, MessageSquare, Trophy, Code, Search, Bell } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'faculty' | 'admin';
}

function App() {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token and user data
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);

    // Check for system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    if (typeof window !== 'undefined' && window.location.pathname === '/discover') {
      return <StudentDiscovery isDark={isDark} toggleTheme={toggleTheme} user={user} />;
    }
    return <Dashboard user={user} isDark={isDark} toggleTheme={toggleTheme} />;
  }

  return <LandingPage isDark={isDark} toggleTheme={toggleTheme} setUser={setUser} />;
}

interface LandingPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  setUser: (user: User | null) => void;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function LandingPage({ isDark, toggleTheme, setUser }: LandingPageProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-futuristic-dark' : 'bg-white'}`}>
      {/* Glassmorphism Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent flex items-center justify-center">
                <Code className="h-6 w-6 text-gray-900 dark:text-gray-100" />
              </div>
              <span className="text-xl font-bold text-black dark:text-white">
                KIET Collab
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-transparent border border-gray-200 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 shadow-[0_0_12px_rgba(234,179,8,0.25)]"
              >
                {isDark ? <Sun className="h-5 w-5 text-gray-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>
              
              <button
                onClick={() => setShowAuth(true)}
                className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-all duration-200 shadow-none"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              🚀 Hack. Build. <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#6A0DAD,#9D4EDD,#C77DFF)' }}>Collaborate.</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The ultimate platform for students to connect, form hackathon teams, showcase skills, and innovate together.
              Whether you’re a coder, designer, or strategist — find your perfect teammates and build the future.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => setShowAuth(true)}
                className="px-8 py-4 rounded-xl text-white text-lg font-medium btn-primary-purple"
              >
                🔥 Join a Hackathon Team
              </button>
              <button className="px-8 py-4 border border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-200 text-lg font-medium">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">5000+</div>
                <div className="text-gray-600 dark:text-gray-300">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">100+</div>
                <div className="text-gray-600 dark:text-gray-300">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">50+</div>
                <div className="text-gray-600 dark:text-gray-300">Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">10+</div>
                <div className="text-gray-600 dark:text-gray-300">Branches</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to collaborate
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built specifically for KIET students, by KIET students. Experience seamless collaboration like never before.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Student Discovery"
              description="Find and connect with talented peers across different branches and years. Build your network and discover collaboration opportunities."
              isDark={isDark}
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Events & Hackathons"
              description="Stay updated with the latest events, hackathons, and competitions. Register, participate, and showcase your skills."
              isDark={isDark}
            />
            <FeatureCard
              icon={<Code className="h-8 w-8" />}
              title="Project Showcase"
              description="Display your projects, get feedback, and inspire others. From academic assignments to personal innovations."
              isDark={isDark}
            />
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="Real-time Chat"
              description="Instant messaging with typing indicators, file sharing, and group conversations. Stay connected with your team."
              isDark={isDark}
            />
            <FeatureCard
              icon={<Trophy className="h-8 w-8" />}
              title="Q&A Forum"
              description="Ask questions, share knowledge, and help fellow students. Build a collaborative learning environment."
              isDark={isDark}
            />
            <FeatureCard
              icon={<Search className="h-8 w-8" />}
              title="Smart Search"
              description="Find exactly what you're looking for with intelligent search across projects, users, and discussions."
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          onClose={() => setShowAuth(false)}
          onSuccess={setUser}
          isDark={isDark}
        />
      )}
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isDark: boolean;
}

function FeatureCard({ icon, title, description, isDark }: FeatureCardProps) {
  return (
    <div className="group p-6 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:-translate-y-1 shadow-none hover:shadow-none">
      <div className="text-gray-700 dark:text-gray-300 mb-4 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

interface AuthModalProps {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  onClose: () => void;
  onSuccess: (user: User) => void;
  isDark: boolean;
}

function AuthModal({ isLogin, setIsLogin, onClose, onSuccess, isDark }: AuthModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    year: '',
    branch: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store tokens and user data
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLogin ? 'Welcome Back' : 'Join KIET Collab'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                KIET Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="yourname@kiet.edu"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Branch
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Branch</option>
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="ME">ME</option>
                      <option value="CE">CE</option>
                      <option value="MBA">MBA</option>
                      <option value="MCA">MCA</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-all duration-200 shadow-none disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-gray-700 dark:text-gray-300 hover:underline font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardProps {
  user: User;
  isDark: boolean;
  toggleTheme: () => void;
}

import AdminDashboard from './components/AdminDashboard';
import StudentDiscovery from './pages/StudentDiscovery';

function Dashboard({ user, isDark, toggleTheme }: DashboardProps) {
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-futuristic-dark' : 'bg-white'}`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent flex items-center justify-center">
                <Code className="h-6 w-6 text-gray-900 dark:text-gray-100" />
              </div>
              <span className="text-xl font-bold text-black dark:text-white">
                KIET Collab
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg bg-transparent border border-gray-200 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 relative shadow-[0_0_12px_rgba(234,179,8,0.25)]">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-gray-500 rounded-full"></span>
              </button>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-transparent border border-gray-200 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 shadow-[0_0_12px_rgba(234,179,8,0.25)]"
              >
                {isDark ? <Sun className="h-5 w-5 text-gray-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>

              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.25)]">
                  <span className="text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Ready to collaborate and create amazing things together?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Your Projects"
            value="3"
            icon={<Code className="h-6 w-6" />}
            color="blue"
            isDark={isDark}
          />
          <StatCard
            title="Events Joined"
            value="7"
            icon={<Calendar className="h-6 w-6" />}
            color="green"
            isDark={isDark}
          />
          <StatCard
            title="Connections"
            value="24"
            icon={<Users className="h-6 w-6" />}
            color="purple"
            isDark={isDark}
          />
          <StatCard
            title="Forum Posts"
            value="12"
            icon={<MessageSquare className="h-6 w-6" />}
            color="orange"
            isDark={isDark}
          />
        </div>

        {user.role === 'admin' && (
          <AdminDashboard />
        )}

        {/* Modules */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ComingSoonCard
            title="Project Showcase"
            description="Display and manage your projects with detailed documentation and media."
            icon={<Code className="h-8 w-8" />}
            isDark={isDark}
          />
          <ComingSoonCard
            title="Events & Hackathons"
            description="Discover and register for upcoming events, competitions, and hackathons."
            icon={<Calendar className="h-8 w-8" />}
            isDark={isDark}
          />
          <ComingSoonCard
            title="Student Discovery"
            description="Find and connect with talented peers across different branches and years."
            icon={<Users className="h-8 w-8" />}
            isDark={isDark}
          />
          <ComingSoonCard
            title="Real-time Chat"
            description="Instant messaging with your team members and collaborators."
            icon={<MessageSquare className="h-8 w-8" />}
            isDark={isDark}
          />
          <ComingSoonCard
            title="Q&A Forum"
            description="Ask questions, share knowledge, and help fellow students learn."
            icon={<Trophy className="h-8 w-8" />}
            isDark={isDark}
          />
          <ComingSoonCard
            title="Smart Search"
            description="Find exactly what you're looking for across the entire platform."
            icon={<Search className="h-8 w-8" />}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  isDark: boolean;
}

function StatCard({ title, value, icon, color, isDark }: StatCardProps) {
  const colorClasses = {
    blue: 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/40',
    green: 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/40',
    purple: 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/40',
    orange: 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/40'
  };

  return (
    <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-none">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface ComingSoonCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isDark: boolean;
}

function ComingSoonCard({ title, description, icon, isDark }: ComingSoonCardProps) {
  return (
    <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:-translate-y-1 shadow-none hover:shadow-none group">
      <div className="flex items-start justify-between mb-4">
        <div className="text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
        <span className="px-3 py-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
          Coming Soon
        </span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
    </div>
  );
}

export default App;
