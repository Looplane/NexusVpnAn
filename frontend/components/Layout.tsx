
import React, { useState, useEffect } from 'react';
import { Shield, Menu, X, LogOut, User as UserIcon, LayoutDashboard, Settings, Sun, Moon, HelpCircle, LifeBuoy, ServerCog, Bell, Gift } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../contexts';
import { Button, Badge } from './UI';
import { apiClient } from '../services/apiClient';
import { Notification } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      apiClient.getNotifications().then(setNotifications).catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    await apiClient.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-brand-500 selection:text-white transition-colors duration-200">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 transition-transform group-hover:scale-105">
                <Shield size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                NexusVPN
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {!user ? (
                <>
                  <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors">Features</Link>
                  <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors">Pricing</Link>
                  <Link to="/help" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors">Help</Link>
                  
                  <div className="flex items-center space-x-4 ml-4">
                     <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                      {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
                    <Link to="/register"><Button variant="primary" size="sm">Get Started</Button></Link>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-6">
                  {user.role === 'admin' && (
                    <Link to="/admin" className={`text-sm font-medium transition-colors flex items-center space-x-2 ${location.pathname === '/admin' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>
                      <ServerCog size={16} /><span>Master Panel</span>
                    </Link>
                  )}
                  <Link to="/dashboard" className={`text-sm font-medium transition-colors flex items-center space-x-2 ${location.pathname === '/dashboard' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>
                    <LayoutDashboard size={16} /><span>Dashboard</span>
                  </Link>
                  <Link to="/referrals" className={`text-sm font-medium transition-colors flex items-center space-x-2 ${location.pathname === '/referrals' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>
                    <Gift size={16} /><span>Referrals</span>
                  </Link>
                  <Link to="/support" className={`text-sm font-medium transition-colors flex items-center space-x-2 ${location.pathname === '/support' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>
                    <LifeBuoy size={16} /><span>Support</span>
                  </Link>
                  
                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-800" />
                  
                  {/* Notifications */}
                  <div className="relative">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Bell size={18} />
                      {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white flex justify-between">
                          Notifications
                          {unreadCount > 0 && <span className="text-xs text-brand-500">{unreadCount} new</span>}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? <div className="p-4 text-center text-slate-500 text-sm">No notifications</div> : notifications.map(n => (
                            <div key={n.id} onClick={() => handleMarkRead(n.id)} className={`p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${!n.isRead ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{n.title}</p>
                              <p className="text-xs text-slate-500">{n.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile & Settings */}
                  <div className="flex items-center space-x-3">
                     <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                      {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <div className="relative group">
                       <Link to="/settings" className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                         <UserIcon size={14} className="text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                       </Link>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <button onClick={toggleTheme} className="text-slate-600 dark:text-slate-300">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 dark:text-slate-300 p-2">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {!user ? (
                <>
                  <Link to="/help" className="block px-4 py-3 text-slate-600 dark:text-slate-300">Help Center</Link>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Log in</Button></Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}><Button variant="primary" className="w-full justify-start">Get Started</Button></Link>
                </>
              ) : (
                <>
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-amber-600 dark:text-amber-400 font-bold">Master Panel</Link>}
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-slate-600 dark:text-slate-300">Dashboard</Link>
                  <Link to="/referrals" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-slate-600 dark:text-slate-300">Referrals</Link>
                  <Link to="/support" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-slate-600 dark:text-slate-300">Support</Link>
                  <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-slate-600 dark:text-slate-300">Settings</Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-red-500">Log out</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Shield size={20} className="text-brand-600 dark:text-brand-500" />
                <span className="text-lg font-bold text-slate-900 dark:text-white">NexusVPN</span>
              </div>
              <p className="text-slate-500 text-sm">Next-generation privacy protection powered by WireGuard®. Fast, secure, and anonymous.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-brand-500">Download</a></li>
                <li><a href="#" className="hover:text-brand-500">Pricing</a></li>
                <li><a href="#" className="hover:text-brand-500">Locations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Support</h3>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/help" className="hover:text-brand-500">Setup Guide</Link></li>
                <li><a href="#" className="hover:text-brand-500">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/legal/privacy" className="hover:text-brand-500">Privacy Policy</Link></li>
                <li><Link to="/legal/terms" className="hover:text-brand-500">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-900 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} NexusVPN Inc. WireGuard is a registered trademark of Jason A. Donenfeld.
          </div>
        </div>
      </footer>
    </div>
  );
};
