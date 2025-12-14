
import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { Card, Badge, Button, Input, Modal, SmartWindow, Tooltip } from '../components/UI';
import { RemoteTerminal, MetricCard, ServiceControls, FirewallManager, ConfigEditor, LogsPanel, AnalyticsWidget, RevenueChart, UserDistributionChart, ServerLoadChart } from '../components/AdminWidgets';
import { Server, Users, Activity, ShieldAlert, Plus, Trash2, Edit2, Shield, Ban, FileText, Settings as SettingsIcon, ToggleLeft, ToggleRight, Search, Key, Globe, Database, Save, Tag, MoreHorizontal, Cpu, HardDrive, Wifi, Lock, Terminal, CreditCard, Mail, Sliders, AlertTriangle, Layers, Power, RefreshCw, BarChart, Zap, ShieldCheck, MapPin, Smartphone, TrendingUp, Users as UsersIcon, RefreshCcw, Download, Upload, Filter, CheckSquare, XSquare, ChevronRight, File, StopCircle, Copy, FileCode, AlertCircle, Fingerprint, Network } from 'lucide-react';
import { useToast } from '../contexts';
import { User, AuditLogEntry, SystemSetting, Coupon, Campaign } from '../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'servers' | 'users' | 'marketing' | 'audit' | 'settings'>('overview');
  const [settingsTab, setSettingsTab] = useState<'general' | 'security' | 'mail' | 'billing'>('general');
  const [inspectorTab, setInspectorTab] = useState<'dashboard' | 'terminal' | 'firewall' | 'config' | 'logs' | 'provision'>('dashboard');
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  // Modals & Windows
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserWindow, setShowUserWindow] = useState(false);
  const [selectedServer, setSelectedServer] = useState<any | null>(null);
  const [showServerWindow, setShowServerWindow] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [provisionScript, setProvisionScript] = useState('');
  
  // Forms
  const [newServer, setNewServer] = useState({ name: '', city: '', country: '', countryCode: '', ipv4: '' });
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: 20, maxUses: 100, expiresAt: '' });
  const [editedSettings, setEditedSettings] = useState<{[key: string]: string}>({});

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => {
      if(activeTab === 'users') fetchUsers();
      if(activeTab === 'audit') fetchLogs();
      if(activeTab === 'settings') fetchSettings();
      if(activeTab === 'marketing') { fetchCoupons(); fetchCampaigns(); }
  }, [activeTab]);

  useEffect(() => {
      if (selectedServer && inspectorTab === 'provision') {
          apiClient.getServerSetupScript(selectedServer.id).then(res => setProvisionScript(res.script)).catch(() => setProvisionScript('# Failed to load script'));
      }
  }, [selectedServer, inspectorTab]);

  const fetchStats = async () => apiClient.getAdminStats().then(setStats).catch(() => addToast('error', 'Failed to load stats'));
  const fetchUsers = async () => apiClient.getAllUsers().then(setUsers).catch(() => addToast('error', 'Failed load users'));
  const fetchLogs = async () => apiClient.getAuditLogs().then(setLogs).catch(() => addToast('error', 'Failed load logs'));
  const fetchSettings = async () => apiClient.getSystemSettings().then(setSettings).catch(() => addToast('error', 'Failed load settings'));
  const fetchCoupons = async () => apiClient.getCoupons().then(setCoupons).catch(() => addToast('error', 'Failed load coupons'));
  const fetchCampaigns = async () => apiClient.getCampaigns().then(setCampaigns).catch(() => {});

  // Handlers
  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault(); setIsAddingServer(true);
    try { await apiClient.addServer(newServer); addToast('success', 'Server added'); setShowServerModal(false); fetchStats(); } 
    catch { addToast('error', 'Failed'); } finally { setIsAddingServer(false); }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault(); setIsAddingCoupon(true);
    try { await apiClient.createCoupon(newCoupon); addToast('success', 'Coupon created'); setShowCouponModal(false); fetchCoupons(); } 
    catch { addToast('error', 'Failed'); } finally { setIsAddingCoupon(false); }
  };

  const handleDeleteCoupon = async (id: string) => {
    if(!confirm("Delete this coupon?")) return;
    try { await apiClient.deleteCoupon(id); setCoupons(prev => prev.filter(c => c.id !== id)); addToast('success', 'Deleted'); } catch { addToast('error', 'Failed'); }
  };

  const handleRemoveServer = async (id: string) => {
      if (!confirm('Delete this server?')) return;
      try { await apiClient.removeServer(id); addToast('success', 'Removed'); fetchStats(); } catch { addToast('error', 'Failed'); }
  };

  const handleToggleUserStatus = async (user: User) => {
      try { 
          await apiClient.updateUser(user.id, { isActive: !user.isActive }); 
          addToast('success', 'Updated'); 
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !user.isActive } : u));
          if (selectedUser?.id === user.id) setSelectedUser({...selectedUser, isActive: !user.isActive});
      } catch { addToast('error', 'Failed'); }
  };

  const handleToggleSetting = async (key: string, val: string) => {
      try { await apiClient.updateSystemSetting(key, val === 'true' ? 'false' : 'true'); fetchSettings(); } catch { addToast('error', 'Failed'); }
  };

  const saveSettingText = async (key: string) => {
      try { await apiClient.updateSystemSetting(key, editedSettings[key]); addToast('success', 'Saved'); fetchSettings(); } catch { addToast('error', 'Failed'); }
  };

  const handleImpersonate = (userId: string) => addToast('info', 'Switching to user view... (Simulated)');

  const handleDocumentation = () => {
      window.open('https://docs.nexusvpn.com', '_blank');
  };

  const handleEmergencyStop = () => {
      addToast('error', 'SYSTEM LOCKDOWN INITIATED. ALL TUNNELS DROPPED.');
      setShowStopModal(false);
  };

  const copyScript = () => {
      navigator.clipboard.writeText(provisionScript);
      addToast('success', 'Script copied to clipboard');
  };

  if (!stats) return <div className="p-10 text-center text-slate-500">Loading Master Panel...</div>;

  return (
    <div className="min-h-screen pb-24"> 
        {/* Top Status Bar */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2 flex justify-between items-center text-xs transition-colors duration-300">
            <div className="flex items-center space-x-4">
                <span className="flex items-center text-emerald-600 dark:text-emerald-400"><div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div> SYSTEM OPERATIONAL</span>
                <span className="text-slate-500">Version 2.4.0-stable</span>
                <span className="text-slate-500">Last Sync: 12ms ago</span>
            </div>
            <div className="flex items-center space-x-4">
                <button onClick={handleDocumentation} className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white transition-colors">Documentation</button>
                <button onClick={() => setShowStopModal(true)} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-bold flex items-center"><Power size={12} className="mr-1" /> Emergency Stop</button>
            </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center tracking-tight">
                        <Shield className="mr-3 text-brand-500" size={32} /> Master Control Room
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Global infrastructure command center.</p>
                </div>
                
                <div className="flex space-x-3">
                    {activeTab === 'servers' && <Button onClick={() => setShowServerModal(true)}><Plus size={18} className="mr-2" /> Deploy Node</Button>}
                    {activeTab === 'marketing' && <Button onClick={() => setShowCouponModal(true)}><Plus size={18} className="mr-2" /> Create Coupon</Button>}
                </div>
            </div>
            
            {/* Global Search Input */}
            <div className="relative w-full max-w-2xl">
                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search configuration settings, users, or nodes..." 
                    value={globalSearch}
                    onChange={e => setGlobalSearch(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-sm"
                />
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white dark:bg-slate-900 p-1 rounded-xl inline-flex border border-slate-200 dark:border-slate-800 shadow-sm">
            {[
                { id: 'overview', icon: Activity, label: 'Overview' },
                { id: 'servers', icon: Server, label: 'Nodes' },
                { id: 'users', icon: Users, label: 'Users' },
                { id: 'marketing', icon: Tag, label: 'Marketing' },
                { id: 'audit', icon: FileText, label: 'Audit Log' },
                { id: 'settings', icon: SettingsIcon, label: 'Configuration' }
            ].map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id as any)} 
                    className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center ${activeTab === tab.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <tab.icon size={16} className="mr-2" /> {tab.label}
                </button>
            ))}
        </div>
      
      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Stats Cards */}
                <Card className="p-6 border-l-4 border-l-brand-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.users.total}</p>
                        </div>
                        <div className="p-2 bg-brand-500/10 rounded-lg"><Users className="text-brand-500" size={24} /></div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-emerald-500"><Plus size={12} className="mr-1" /> 12% from last week</div>
                </Card>
                <Card className="p-6 border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Tunnels</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.tunnels.total}</p>
                        </div>
                        <div className="p-2 bg-indigo-500/10 rounded-lg"><Activity className="text-indigo-500" size={24} /></div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-slate-400">Peak load at 19:00 UTC</div>
                </Card>
                <Card className="p-6 border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start">
                        <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Infrastructure</p><p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.servers.length} <span className="text-lg font-normal text-slate-500">Nodes</span></p></div>
                        <div className="p-2 bg-amber-500/10 rounded-lg"><Server className="text-amber-500" size={24} /></div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-emerald-500"><ShieldCheck size={12} className="mr-1" /> All Systems Operational</div>
                </Card>
                <Card className="p-6 border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start">
                        <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Revenue</p><p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">$1,240</p></div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg"><CreditCard className="text-emerald-500" size={24} /></div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-slate-400">Projected: $1,500</div>
                </Card>
            </div>
            
            {/* New Charts Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="col-span-2">
                    <RevenueChart />
                </div>
                <div className="col-span-1">
                    <UserDistributionChart />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="col-span-1">
                    <ServerLoadChart />
                </div>
                <div className="col-span-1">
                    <AnalyticsWidget />
                </div>
                <div className="col-span-1 space-y-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center"><Zap size={18} className="mr-2 text-amber-500"/> Quick Actions</h3>
                        <div className="space-y-3">
                            <Button variant="outline" className="w-full text-xs justify-start"><RefreshCcw size={14} className="mr-2"/> Clear System Cache</Button>
                            <Button variant="outline" className="w-full text-xs justify-start"><Database size={14} className="mr-2"/> Backup Database</Button>
                            <Button variant="outline" className="w-full text-xs justify-start"><Download size={14} className="mr-2"/> Download Error Logs</Button>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center"><AlertTriangle size={18} className="mr-2 text-red-500"/> Recent Alerts</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm"><span className="text-amber-500">High latency Tokyo</span><span className="text-slate-500 text-xs">10m ago</span></div>
                            <div className="flex justify-between text-sm"><span className="text-red-500">Failed login (Admin)</span><span className="text-slate-500 text-xs">1h ago</span></div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Audit Logs</h2>
                <div className="flex space-x-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 text-slate-500" size={14} />
                        <input placeholder="Filter logs..." value={auditFilter} onChange={e => setAuditFilter(e.target.value)} className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white w-64 focus:outline-none focus:border-brand-500 transition-colors" />
                    </div>
                    <Button variant="outline"><Download size={16} className="mr-2" /> Export CSV</Button>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                 <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-950">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Severity</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Device Fingerprint</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">{logs.filter(l => l.action.toLowerCase().includes(auditFilter) || l.details?.toLowerCase().includes(auditFilter)).map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <Badge variant={log.severity === 'critical' ? 'danger' : log.severity === 'warning' ? 'warning' : 'neutral'}>
                                    {log.severity ? log.severity.toUpperCase() : 'INFO'}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">{log.action}</td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">{log.details}</div>
                                {log.location && (
                                    <div className="flex items-center text-xs text-slate-500 mt-1">
                                        <MapPin size={12} className="mr-1" /> {log.location}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {log.ipAddress && (
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit">
                                            <Network size={12} className="mr-1.5" /> {log.ipAddress}
                                        </div>
                                        <div className="flex items-center text-xs text-slate-500 truncate max-w-[150px]" title={log.userAgent}>
                                            <Fingerprint size={12} className="mr-1.5" /> {log.userAgent ? (log.userAgent.includes('Mozilla') ? 'Web Browser' : 'CLI/App') : 'Unknown'}
                                        </div>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm font-bold text-brand-600 dark:text-brand-400">{log.actorEmail?.split('@')[0]}</div>
                                <div className="text-xs text-slate-400">{log.actorEmail}</div>
                            </td>
                        </tr>
                    ))}</tbody>
                 </table>
            </div>
          </div>
      )}

      {/* Servers Tab */}
      {(activeTab === 'servers') && (
        <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Infrastructure Nodes</h2>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950"><tr><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">IP</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Load</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">{stats.servers.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium cursor-pointer text-slate-900 dark:text-white hover:text-brand-500" onClick={() => { setSelectedServer(s); setInspectorTab('dashboard'); setShowServerWindow(true); }}>{s.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{s.city}, {s.countryCode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{s.ipv4}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center"><div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mr-2 overflow-hidden"><div className="bg-emerald-500 h-full" style={{width: `${s.load}%`}}></div></div>{s.load}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button onClick={() => { setSelectedServer(s); setInspectorTab('terminal'); setShowServerWindow(true); }} className="text-brand-600 hover:text-brand-500 mr-4"><Terminal size={16} /></button>
                            <button onClick={() => handleRemoveServer(s.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                        </td>
                    </tr>
                ))}</tbody>
                </table>
            </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
         <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h2>
                <div className="flex space-x-2">
                    <Input placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-64" />
                    <Button variant="outline"><Upload size={16} className="mr-2" /> Import</Button>
                    <Button variant="outline"><Download size={16} className="mr-2" /> Export</Button>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950"><tr><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Plan</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th><th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">{users.filter(u => u.email.includes(userSearch) || u.fullName?.includes(userSearch)).map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 cursor-pointer" onClick={() => { setSelectedUser(u); setShowUserWindow(true); }}>
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-3 font-bold text-slate-500">
                                    {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full rounded-full object-cover" /> : u.name[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{u.fullName}</div>
                                    <div className="text-xs text-slate-500">{u.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4"><Badge variant="neutral">{u.plan}</Badge></td>
                        <td className="px-6 py-4"><Badge variant={u.isActive ? 'success' : 'warning'}>{u.isActive ? 'Active' : 'Banned'}</Badge></td>
                        <td className="px-6 py-4 text-right">
                            <Tooltip text="View Details">
                                <button onClick={() => { setSelectedUser(u); setShowUserWindow(true); }} className="text-brand-600 hover:text-brand-500 mr-2"><Edit2 size={16} /></button>
                            </Tooltip>
                        </td>
                    </tr>
                ))}</tbody>
                </table>
            </div>
        </div>
      )}

      {/* Marketing Tab */}
      {activeTab === 'marketing' && (
         <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Marketing Headquarters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {campaigns.map(c => (
                    <Card key={c.id} className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{c.name}</h3>
                                <Badge variant={c.status === 'active' ? 'success' : c.status === 'paused' ? 'warning' : 'neutral'}>{c.status}</Badge>
                            </div>
                            <TrendingUp className="text-emerald-500" size={20} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-slate-500">Clicks</p><p className="text-slate-900 dark:text-white font-mono">{c.clicks}</p></div>
                            <div><p className="text-slate-500">Conversions</p><p className="text-slate-900 dark:text-white font-mono">{c.conversions}</p></div>
                            <div><p className="text-slate-500">Spend</p><p className="text-slate-900 dark:text-white font-mono">${c.spend}</p></div>
                            <div><p className="text-slate-500">ROI</p><p className={`font-mono font-bold ${c.roi > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{c.roi}%</p></div>
                        </div>
                    </Card>
                ))}
            </div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Coupons</h3>
                <Button onClick={() => setShowCouponModal(true)} size="sm"><Plus size={16} className="mr-2"/> Create Coupon</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map(c => (
                <Card key={c.id} className="p-4 flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-2"><Tag size={16} className="text-brand-500" /><span className="font-bold text-lg text-slate-900 dark:text-white">{c.code}</span><Badge variant={c.isActive ? 'success' : 'neutral'}>{c.isActive ? 'Active' : 'Expired'}</Badge></div>
                        <p className="text-sm text-slate-500 mt-1">{c.discountPercent}% OFF • {c.usedCount} / {c.maxUses} used</p>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteCoupon(c.id)}><Trash2 size={14}/></Button>
                </Card>
            ))}
            </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
          <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-3 space-y-1">
                  {['general', 'security', 'mail', 'billing'].map(t => (
                      <button 
                        key={t} 
                        onClick={() => setSettingsTab(t as any)} 
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${settingsTab === t ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                          <ChevronRight size={14} className={`opacity-0 ${settingsTab === t ? 'opacity-100' : ''}`} />
                      </button>
                  ))}
              </div>
              <div className="col-span-12 md:col-span-9 space-y-4">
                  {settings.filter(s => s.category === settingsTab || (!s.category && settingsTab === 'general')).map(s => (
                      <Card key={s.key} className="p-6 flex items-center justify-between">
                          <div className="max-w-lg">
                              <h3 className="font-semibold text-slate-900 dark:text-white capitalize text-base">{s.key.replace(/_/g, ' ')}</h3>
                              <p className="text-sm text-slate-500 mt-1">{s.description}</p>
                          </div>
                          {s.value === 'true' || s.value === 'false' ? (
                              <button onClick={() => handleToggleSetting(s.key, s.value)} className={`text-2xl transition-colors ${s.value === 'true' ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}>
                                  {s.value === 'true' ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                              </button>
                          ) : (
                              <div className="flex space-x-2 w-1/3">
                                  <Input 
                                    value={editedSettings[s.key] ?? s.value} 
                                    onChange={e => setEditedSettings(p => ({...p, [s.key]: e.target.value}))} 
                                    className="h-10 text-sm" 
                                  />
                                  <Button size="sm" onClick={() => saveSettingText(s.key)}><Save size={16} /></Button>
                              </div>
                          )}
                      </Card>
                  ))}
              </div>
          </div>
      )}

      {/* --- MODALS --- */}
      {/* ... (Modals remain unchanged) ... */}
      <Modal isOpen={showServerModal} onClose={() => setShowServerModal(false)} title="Add VPN Node">
          <form onSubmit={handleAddServer} className="space-y-4">
              <Input label="Server Name" value={newServer.name} onChange={e => setNewServer({...newServer, name: e.target.value})} required placeholder="e.g. Frankfurt Node 1" />
              <div className="grid grid-cols-2 gap-4"><Input label="City" value={newServer.city} onChange={e => setNewServer({...newServer, city: e.target.value})} required /><Input label="Country Code" value={newServer.countryCode} onChange={e => setNewServer({...newServer, countryCode: e.target.value})} required maxLength={2} /></div>
              <Input label="IPv4" value={newServer.ipv4} onChange={e => setNewServer({...newServer, ipv4: e.target.value})} required />
              <Button type="submit" isLoading={isAddingServer} className="w-full">Deploy</Button>
          </form>
      </Modal>

      <Modal isOpen={showCouponModal} onClose={() => setShowCouponModal(false)} title="Create Coupon">
          <form onSubmit={handleAddCoupon} className="space-y-4">
              <Input label="Code" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} required />
              <div className="grid grid-cols-2 gap-4"><Input label="Discount %" type="number" value={newCoupon.discountPercent} onChange={e => setNewCoupon({...newCoupon, discountPercent: parseInt(e.target.value)})} /><Input label="Max Uses" type="number" value={newCoupon.maxUses} onChange={e => setNewCoupon({...newCoupon, maxUses: parseInt(e.target.value)})} /></div>
              <Button type="submit" isLoading={isAddingCoupon} className="w-full">Create</Button>
          </form>
      </Modal>

      <Modal isOpen={showStopModal} onClose={() => setShowStopModal(false)} title="EMERGENCY STOP">
          <div className="text-center space-y-4">
              <AlertTriangle size={64} className="text-red-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">ARE YOU SURE?</h3>
              <p className="text-slate-500 dark:text-slate-400">This will immediately disconnect all users and shut down the VPN interfaces on all nodes. This action logs a critical audit event.</p>
              <Button variant="danger" className="w-full" onClick={handleEmergencyStop}>CONFIRM SHUTDOWN</Button>
          </div>
      </Modal>

      {/* --- SMART WINDOWS --- */}
      {/* ... (SmartWindows remain largely unchanged, just checking styles) ... */}
      <SmartWindow id="user-inspector" isOpen={showUserWindow} onClose={() => setShowUserWindow(false)} title={`User Inspector: ${selectedUser?.fullName || 'Loading...'}`}>
          {selectedUser && (
              <div className="space-y-6">
                  <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-500 overflow-hidden">
                          {selectedUser.avatarUrl ? <img src={selectedUser.avatarUrl} className="w-full h-full object-cover" /> : (selectedUser.fullName?.charAt(0) || 'U')}
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedUser.fullName}</h3>
                          <p className="text-xs text-slate-500 font-mono">{selectedUser.id}</p>
                          <div className="flex space-x-2 mt-2">
                              <Badge variant={selectedUser.isActive ? 'success' : 'danger'}>{selectedUser.isActive ? 'ACTIVE' : 'BANNED'}</Badge>
                              <Badge variant="brand">{selectedUser.plan.toUpperCase()}</Badge>
                          </div>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" onClick={() => handleToggleUserStatus(selectedUser)} className="border-slate-300 dark:border-slate-700 bg-white dark:bg-transparent">
                          {selectedUser.isActive ? 'Ban User' : 'Unban User'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleImpersonate(selectedUser.id)} className="border-slate-300 dark:border-slate-700 bg-white dark:bg-transparent">Impersonate</Button>
                      <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-700 bg-white dark:bg-transparent">Reset Password</Button>
                      <Button variant="danger" size="sm" className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50">Delete Account</Button>
                  </div>
              </div>
          )}
      </SmartWindow>

      <SmartWindow id="node-inspector" isOpen={showServerWindow} onClose={() => setShowServerWindow(false)} title={`Node Inspector: ${selectedServer?.name || 'Loading...'}`} defaultWidth="w-[700px]">
          {selectedServer && (
              <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                      <div>
                          <div className="flex items-center space-x-2">
                              <span className={`fi fi-${selectedServer.countryCode.toLowerCase()} rounded shadow-sm`}></span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">{selectedServer.city}, {selectedServer.country}</span>
                          </div>
                          <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{selectedServer.ipv4}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                          <div className="text-right">
                              <div className="text-xs text-slate-500">Uptime</div>
                              <div className="text-sm font-mono text-slate-900 dark:text-white">14d 02h 12m</div>
                          </div>
                          <Badge variant="success">ONLINE</Badge>
                      </div>
                  </div>
                  <div className="flex space-x-1 mb-4 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
                      {['dashboard', 'terminal', 'provision', 'firewall', 'config', 'logs'].map(t => (
                          <button key={t} onClick={() => setInspectorTab(t as any)} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors uppercase tracking-wide whitespace-nowrap ${inspectorTab === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>{t}</button>
                      ))}
                  </div>
                  <div className="flex-1 overflow-hidden flex flex-col">
                    {inspectorTab === 'dashboard' && (
                        <div className="space-y-4 overflow-y-auto pr-2">
                            <div className="grid grid-cols-3 gap-3">
                                <MetricCard label="CPU" value={selectedServer.metrics?.cpu || 45} unit="%" icon={Cpu} color="text-brand-500" detail="8 Cores @ 3.2GHz" />
                                <MetricCard label="RAM" value={selectedServer.metrics?.ram || 60} unit="%" icon={HardDrive} color="text-indigo-500" detail="12/16 GB Used" />
                                <MetricCard label="Load" value={Math.floor(selectedServer.metrics?.network / 10) || 12} unit="%" icon={Activity} color="text-emerald-500" detail="LA: 0.45, 0.32, 0.15" />
                            </div>
                            <AnalyticsWidget />
                            <ServiceControls />
                        </div>
                    )}
                    {inspectorTab === 'terminal' && <RemoteTerminal serverName={selectedServer.name} ip={selectedServer.ipv4} serverId={selectedServer.id} />}
                    {inspectorTab === 'provision' && (
                        <div className="space-y-4 h-full flex flex-col">
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 p-3 rounded-lg flex items-start space-x-3">
                                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                <div className="text-xs text-amber-700 dark:text-amber-200">
                                    <p className="font-bold mb-1">Node Provisioning Required</p>
                                    Run this script on the new server to install WireGuard and authorize the backend to manage it.
                                </div>
                            </div>
                            <div className="relative flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-600 dark:text-slate-300 overflow-auto">
                                <pre>{provisionScript || 'Generating script...'}</pre>
                                <button onClick={copyScript} className="absolute top-2 right-2 p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-white shadow border border-slate-200 dark:border-slate-700"><Copy size={14}/></button>
                            </div>
                        </div>
                    )}
                    {inspectorTab === 'firewall' && <FirewallManager />}
                    {inspectorTab === 'config' && <ConfigEditor />}
                    {inspectorTab === 'logs' && <LogsPanel />}
                  </div>
              </div>
          )}
      </SmartWindow>
      </div>
    </div>
  );
};
