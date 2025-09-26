import React, { useState, useEffect } from 'react';
import { Moon, Sun, Users, Calendar, MessageSquare, Trophy, Code, Search, Bell, Sparkles, Zap, Rocket } from 'lucide-react';

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

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

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
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${isDark ? 'bg-futuristic-dark' : 'bg-futuristic-light'}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="spinner w-12 h-12"></div>
          <p className="text-primary animate-pulse">Loading KIET Collab...</p>
        </div>
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
    <div className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-futuristic-dark' : 'bg-futuristic-light'}`}>
      {/* Glassmorphism Navigation */}
      <nav className="sticky top-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center glow-purple">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">
                KIET Collab
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl card-futuristic hover:glow-purple transition-all duration-300"
              >
                {isDark ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
              </button>
              
              <button
                onClick={() => setShowAuth(true)}
                className="px-6 py-2 btn-primary-gradient text-white rounded-xl font-medium"
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
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-purple-400 mr-2 animate-pulse" />
              <Zap className="h-6 w-6 text-blue-400 animate-bounce" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-6 animate-float">
              🚀 Hack. Build. <span className="text-gradient">Collaborate.</span>
            </h1>
            
            <p className="text-xl text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
              The ultimate platform for students to connect, form hackathon teams, showcase skills, and innovate together.
              Whether you’re a coder, designer, or strategist — find your perfect teammates and build the future.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => setShowAuth(true)}
                className="px-8 py-4 rounded-xl text-white text-lg font-medium btn-primary-gradient animate-pulse-glow"
              >
                🔥 Join a Hackathon Team
              </button>
              <button className="px-8 py-4 rounded-xl text-lg font-medium btn-outline-gradient">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-semibold text-primary">5000+</div>
                <div className="text-secondary">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-primary">200+</div>
                <div className="text-secondary">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-primary">100+</div>
                <div className="text-secondary">Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-primary">20+</div>
                <div className="text-secondary">Branches</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Collab Section */}
      <div className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Why Collab
            </h2>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Find Teammates Instantly • Collaborate Across Branches • Showcase Your Projects �� Win Hackathons & Prizes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={<Users className="h-8 w-8" />} title="Find Teammates Instantly" description="Search by skills and availability to instantly find collaborators." />
            <FeatureCard icon={<Calendar className="h-8 w-8" />} title="Collaborate Across Branches" description="Bridge departments and years; work with the best minds across KIET." />
            <FeatureCard icon={<Code className="h-8 w-8" />} title="Showcase Your Projects" description="Publish projects, gather feedback, and build your portfolio." />
            <FeatureCard icon={<Trophy className="h-8 w-8" />} title="Win Hackathons & Prizes" description="Form strong teams, ship fast, and climb leaderboards." />
            <FeatureCard
              icon={<Trophy className="h-8 w-8" />}
              title="Q&A Forum"
              description="Ask questions, share knowledge, and help fellow students. Build a collaborative learning environment."
            />
            <FeatureCard
              icon={<Search className="h-8 w-8" />}
              title="Smart Search"
              description="Find exactly what you're looking for with intelligent search across projects, users, and discussions."
            />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="py-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl p-6 card-futuristic">
              <div className="text-sm text-secondary mb-2">Step 1</div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Sign Up</h3>
              <p className="text-secondary">Create your profile with skills and availability.</p>
            </div>
            <div className="rounded-2xl p-6 card-futuristic">
              <div className="text-sm text-secondary mb-2">Step 2</div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Find Team</h3>
              <p className="text-secondary">Search and match with collaborators across branches.</p>
            </div>
            <div className="rounded-2xl p-6 card-futuristic">
              <div className="text-sm text-secondary mb-2">Step 3</div>
              <h3 className="text-xl font-semibold mb-2 text-primary">Start Building</h3>
              <p className="text-secondary">Join a hackathon, build fast, and showcase your project.</p>
            </div>
          </div>
        </div>
      </section>

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
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-6 rounded-2xl feature-card transition-all duration-300 hover:-translate-y-1">
      <div className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
      <p className="text-secondary">{description}</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="w-full max-w-md card-futuristic rounded-2xl shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">
              {isLogin ? 'Welcome Back' : 'Join KIET Collab'}
            </h2>
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                KIET Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="yourname@kiet.edu"
                className="w-full px-4 py-3 rounded-lg input-futuristic transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg input-futuristic transition-all duration-200"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg input-futuristic transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Year
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg input-futuristic transition-all duration-200"
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Branch
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg input-futuristic transition-all duration-200"
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
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 btn-primary-gradient text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-secondary">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-purple-400 hover:text-purple-300 hover:underline font-medium transition-colors"
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
    <div className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-futuristic-dark' : 'bg-futuristic-light'}`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center glow-purple">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">
                KIET Collab
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-xl card-futuristic hover:glow-blue transition-all duration-300 relative">
                <Bell className="h-5 w-5 text-primary" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></span>
              </button>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl card-futuristic hover:glow-purple transition-all duration-300"
              >
                {isDark ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
              </button>

              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center glow-purple">
                  <span className="text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-primary">{user.name}</p>
                  <p className="text-xs text-secondary">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-400 hover:text-red-300 hover:underline transition-colors"
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
          <h1 className="text-3xl font-bold text-primary">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-secondary mt-2">
            Ready to collaborate and create amazing things together?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Your Projects"
            value="3"
            icon={<Code className="h-6 w-6" />}
            color="purple"
          />
          <StatCard
            title="Events Joined"
            value="7"
            icon={<Calendar className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Connections"
            value="24"
            icon={<Users className="h-6 w-6" />}
            color="pink"
          />
          <StatCard
            title="Forum Posts"
            value="12"
            icon={<MessageSquare className="h-6 w-6" />}
            color="gradient"
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
          />
          <ComingSoonCard
            title="Events & Hackathons"
            description="Discover and register for upcoming events, competitions, and hackathons."
            icon={<Calendar className="h-8 w-8" />}
          />
          <ComingSoonCard
            title="Student Discovery"
            description="Find and connect with talented peers across different branches and years."
            icon={<Users className="h-8 w-8" />}
          />
          <ComingSoonCard
            title="Real-time Chat"
            description="Instant messaging with your team members and collaborators."
            icon={<MessageSquare className="h-8 w-8" />}
          />
          <ComingSoonCard
            title="Q&A Forum"
            description="Ask questions, share knowledge, and help fellow students learn."
            icon={<Trophy className="h-8 w-8" />}
          />
          <ComingSoonCard
            title="Smart Search"
            description="Find exactly what you're looking for across the entire platform."
            icon={<Search className="h-8 w-8" />}
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
  color: 'purple' | 'blue' | 'pink' | 'gradient';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    purple: 'text-purple-400 bg-purple-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    pink: 'text-pink-400 bg-pink-500/10',
    gradient: 'text-purple-400 bg-gradient-to-br from-purple-500/10 to-blue-500/10'
  };

  return (
    <div className="stat-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary">{title}</p>
          <p className="text-2xl font-bold text-primary">{value}</p>
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
}

function ComingSoonCard({ title, description, icon }: ComingSoonCardProps) {
  return (
    <div className="feature-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-start justify-between mb-4">
        <div className="text-purple-400 group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
          Coming Soon
        </span>
      </div>
      <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
      <p className="text-secondary text-sm">{description}</p>
    </div>
  );
}

export default App;
