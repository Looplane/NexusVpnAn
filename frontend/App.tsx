

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { Support } from './pages/Support';
import { AdminDashboard } from './pages/Admin';
import { Referrals } from './pages/Referrals';
import { Legal } from './pages/Legal';
import { NotFound } from './pages/NotFound';
import { User, ToastType } from './types';
import { apiClient } from './services/apiClient';
import { ToastContainer, ToastMessage } from './components/UI';
import { CommandPalette } from './components/Widgets';
import { AuthContext, ThemeContext, ToastContext, useAuth } from './contexts';

// --- Providers ---
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Command Palette State
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) setIsDark(true);
    
    // Initial Auth Check
    const checkAuth = async () => {
        const savedToken = localStorage.getItem('nexus_vpn_token');
        if (savedToken) {
            try {
                // Verify token with backend
                const profile = await apiClient.getProfile();
                if (profile && profile.email) {
                    setUser(profile);
                    // Update local storage backup
                    localStorage.setItem('nexus_vpn_user', JSON.stringify(profile));
                } else {
                    throw new Error('Invalid Profile');
                }
            } catch (e) {
                console.warn('Auth check failed:', e);
                const savedUser = localStorage.getItem('nexus_vpn_user');
                if (savedUser) setUser(JSON.parse(savedUser));
            }
        }
        setIsLoading(false);
    };

    checkAuth();

    // Global Key Listener
    const handleKey = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setIsCmdOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKey);

    // Global Unauthorized Listener
    const handleUnauthorized = () => {
        logout();
        addToast('warning', 'Session expired. Please log in again.');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
        window.removeEventListener('keydown', handleKey);
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) html.classList.add('dark'); else html.classList.remove('dark');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const addToast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const login = async (email: string, pass: string, code?: string) => {
    try {
      const result = await apiClient.login(email, pass, code);
      if (result.requires2fa) return { requires2fa: true };
      if (result.user && result.access_token) {
        setUser(result.user);
        localStorage.setItem('nexus_vpn_user', JSON.stringify(result.user));
        localStorage.setItem('nexus_vpn_token', result.access_token);
        addToast('success', `Welcome back, ${result.user.name || result.user.fullName || result.user.email}!`);
      }
    } catch (e) { addToast('error', 'Invalid credentials or code.'); throw e; }
  };

  const register = async (email: string, pass: string) => {
    try { await apiClient.register(email, pass); await login(email, pass); } catch (e) { addToast('error', 'Registration failed.'); throw e; }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexus_vpn_user');
    localStorage.removeItem('nexus_vpn_token');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('nexus_vpn_user', JSON.stringify(updatedUser));
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ToastContext.Provider value={{ addToast }}>
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
          {children}
          <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </AuthContext.Provider>
      </ToastContext.Provider>
    </ThemeContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-brand-500 font-bold">Verifying Credentials...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AppProviders>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthPage type="login" />} />
            <Route path="/register" element={<AuthPage type="register" />} />
            <Route path="/help" element={<Help />} />
            <Route path="/legal/:type" element={<Legal />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProviders>
  );
};

export default App;
