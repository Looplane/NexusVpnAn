
import React, { useState, useEffect } from 'react';
import { useAuth, useToast } from '../contexts';
import { apiClient } from '../services/apiClient';
import { Button, Input, Card, Badge, Modal, Tooltip } from '../components/UI';
import { User, Mail, Shield, Key, CreditCard, Clock, FileText, Smartphone, QrCode, Terminal, Globe, Lock, Activity, Bell, Trash2, Plus, Copy, Eye, EyeOff, RefreshCw, Zap, Laptop, History, Check, Edit2, Play, Pause, AlertTriangle, Monitor } from 'lucide-react';
import { PLANS, BillingInvoice, ApiKey, WebhookEndpoint, ActiveSession, LoginHistory, AuditLogEntry } from '../types';

type SettingsTab = 'profile' | 'security' | 'billing' | 'developer' | 'notifications' | 'logs';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row h-full gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 px-2">Settings</h1>
            {[
                { id: 'profile', icon: User, label: 'My Profile' },
                { id: 'security', icon: Shield, label: 'Security' },
                { id: 'billing', icon: CreditCard, label: 'Billing & Plans' },
                { id: 'developer', icon: Terminal, label: 'Developer Platform' },
                { id: 'notifications', icon: Bell, label: 'Notifications' },
                { id: 'logs', icon: Activity, label: 'Activity Log' },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <tab.icon size={18} className="mr-3" />
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 pb-20">
            {activeTab === 'profile' && <ProfileSettings user={user} updateUser={updateUser} />}
            {activeTab === 'security' && <SecuritySettings user={user} updateUser={updateUser} />}
            {activeTab === 'billing' && <BillingSettings user={user} updateUser={updateUser} />}
            {activeTab === 'developer' && <DeveloperSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'logs' && <LogsSettings />}
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const ProfileSettings: React.FC<{ user: any, updateUser: any }> = ({ user, updateUser }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        fullName: user.fullName || user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
        language: user.language || 'English',
        timezone: user.timezone || 'UTC'
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await apiClient.updateProfile(formData);
            updateUser(updated);
            addToast('success', 'Profile updated successfully');
        } catch { addToast('error', 'Failed to update profile'); }
        finally { setIsSaving(false); }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Public Profile</h2>
                <p className="text-slate-500 text-sm">Manage how your account appears to others.</p>
            </div>
            
            <Card className="p-6">
                <div className="flex items-center space-x-6 mb-8">
                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-500 overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800">
                        {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user.name[0]}
                    </div>
                    <div>
                        <Button variant="outline" size="sm">Change Avatar</Button>
                        <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. Max 1MB.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                        <Input label="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <Input label="Email Address" value={formData.email} disabled className="opacity-70 cursor-not-allowed" description="Contact support to change email." />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                        <Input label="Phone Number" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} placeholder="+1 (555) 000-0000" />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Language</label>
                        <select 
                            value={formData.language} 
                            onChange={e => setFormData({...formData, language: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-brand-500"
                        >
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                            <option>Japanese</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Bio</label>
                        <textarea 
                            rows={3}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
                            value={formData.bio}
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            placeholder="Tell us a little about yourself..."
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Timezone</label>
                        <select 
                            value={formData.timezone}
                            onChange={e => setFormData({...formData, timezone: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-brand-500"
                        >
                            <option>UTC (GMT+00:00)</option>
                            <option>America/New_York (GMT-05:00)</option>
                            <option>Europe/London (GMT+00:00)</option>
                            <option>Asia/Tokyo (GMT+09:00)</option>
                        </select>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                    <Button onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
                </div>
            </Card>

            <Card className="p-6 border-red-200 dark:border-red-900/30">
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Delete Account</h3>
                <p className="text-sm text-slate-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <Button variant="danger">Delete Account</Button>
            </Card>
        </div>
    );
};

const SecuritySettings: React.FC<{ user: any, updateUser: any }> = ({ user, updateUser }) => {
    const { addToast } = useToast();
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [history, setHistory] = useState<LoginHistory[]>([]);
    const [show2fa, setShow2fa] = useState(false);
    const [qr, setQr] = useState('');
    const [code, setCode] = useState('');

    useEffect(() => {
        apiClient.getActiveSessions().then(setSessions).catch(() => {});
        apiClient.getLoginHistory().then(setHistory).catch(() => {});
    }, []);

    const handleEnable2FA = async () => {
        try {
            const { qrCode } = await apiClient.generate2fa();
            setQr(qrCode);
            setShow2fa(true);
        } catch { addToast('error', 'Failed to init 2FA'); }
    };

    const confirm2FA = async () => {
        try {
            await apiClient.enable2fa(code);
            updateUser({ ...user, isTwoFactorEnabled: true });
            setShow2fa(false);
            addToast('success', '2FA Enabled');
        } catch { addToast('error', 'Invalid code'); }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security & Auth</h2>
                <p className="text-slate-500 text-sm">Protect your account and manage active sessions.</p>
            </div>

            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center"><Smartphone className="mr-2" size={18}/> Two-Factor Authentication</h3>
                        <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                    </div>
                    {user.isTwoFactorEnabled ? <Badge variant="success">Enabled</Badge> : <Button size="sm" onClick={handleEnable2FA}>Enable</Button>}
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center"><Key className="mr-2" size={18}/> Password</h3>
                    <div className="flex gap-4">
                        <Input type="password" placeholder="Current Password" className="max-w-xs" />
                        <Input type="password" placeholder="New Password" className="max-w-xs" />
                        <Button variant="outline">Update</Button>
                    </div>
                </div>
            </Card>

            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center"><Laptop className="mr-2" size={18}/> Active Sessions</h3>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {sessions.map(s => (
                        <div key={s.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-lg ${s.isCurrent ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{s.ipAddress} <span className="text-slate-500 font-normal">• {s.location}</span></p>
                                    <p className="text-xs text-slate-500">{s.browser || s.deviceType} • {s.os}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {s.isCurrent ? <Badge variant="success">Current Device</Badge> : <span className="text-xs text-slate-500">Last active: {s.lastActive}</span>}
                                {!s.isCurrent && <button className="text-red-500 hover:text-red-600 text-xs font-bold">Revoke</button>}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center"><History className="mr-2" size={18}/> Login History</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500"><tr><th className="p-4">Event</th><th className="p-4">Location</th><th className="p-4">Time</th><th className="p-4">Status</th></tr></thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {history.map(h => (
                            <tr key={h.id}>
                                <td className="p-4 font-mono text-slate-700 dark:text-slate-300">{h.ip}</td>
                                <td className="p-4">{h.location}</td>
                                <td className="p-4 text-slate-500">{new Date(h.timestamp).toLocaleString()}</td>
                                <td className="p-4"><Badge variant={h.status === 'success' ? 'success' : 'danger'}>{h.status}</Badge></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal isOpen={show2fa} onClose={() => setShow2fa(false)} title="Setup 2FA">
                <div className="text-center space-y-4">
                    <p className="text-sm text-slate-500">Scan this QR code with Google Authenticator.</p>
                    <div className="bg-white p-4 inline-block rounded-xl"><img src={qr} className="w-40 h-40" /></div>
                    <Input placeholder="Enter 6-digit code" value={code} onChange={e => setCode(e.target.value)} className="text-center text-xl tracking-widest" maxLength={6} />
                    <Button onClick={confirm2FA} className="w-full">Activate</Button>
                </div>
            </Modal>
        </div>
    );
};

const DeveloperSettings: React.FC = () => {
    const { addToast } = useToast();
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
    
    // Modal States
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [showWebhookModal, setShowWebhookModal] = useState(false);
    
    // Forms
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyToken, setNewKeyToken] = useState<string | null>(null);
    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>(['tunnel.connected']);

    useEffect(() => {
        apiClient.getApiKeys().then(setKeys).catch(() => {});
        apiClient.getWebhooks().then(setWebhooks).catch(() => {});
    }, []);

    // --- Key Handlers ---
    const createKey = async () => {
        try {
            const k = await apiClient.createApiKey(newKeyName, ['read', 'write']);
            setKeys([...keys, k]);
            setNewKeyToken(`nx_live_${Math.random().toString(36).substring(2)}_${Math.random().toString(36).substring(2)}`);
            addToast('success', 'Key Created');
        } catch { addToast('error', 'Failed'); }
    };

    const copyToken = () => {
        navigator.clipboard.writeText(newKeyToken || '');
        addToast('success', 'Copied to clipboard');
    };

    const toggleKeyStatus = async (id: string, currentStatus: string) => {
        // Mock API update
        const newStatus = currentStatus === 'active' ? 'revoked' : 'active';
        setKeys(prev => prev.map(k => k.id === id ? { ...k, status: newStatus as any } : k));
        addToast('success', `Key ${newStatus}`);
    };

    // --- Webhook Handlers ---
    const createWebhook = async () => {
        try {
            const w = await apiClient.createWebhook(newWebhookUrl, newWebhookEvents);
            setWebhooks([...webhooks, w]);
            setShowWebhookModal(false);
            setNewWebhookUrl('');
            addToast('success', 'Webhook Registered');
        } catch { addToast('error', 'Failed to register webhook'); }
    };

    const testWebhook = async (id: string) => {
        try {
            await apiClient.testWebhook(id);
            addToast('success', 'Test Event Sent');
        } catch { addToast('error', 'Test Failed'); }
    };

    const deleteWebhook = async (id: string) => {
        if(!confirm('Remove this endpoint?')) return;
        setWebhooks(prev => prev.filter(w => w.id !== id));
        addToast('success', 'Endpoint Removed');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Developer Platform</h2>
                <p className="text-slate-500 text-sm">Manage API keys and Webhooks for integration.</p>
            </div>

            {/* API Keys */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">API Keys</h3>
                        <p className="text-sm text-slate-500">Manage programmatic access to the NexusVPN API.</p>
                    </div>
                    <Button size="sm" onClick={() => setShowKeyModal(true)}><Plus size={16} className="mr-2"/> Generate New Key</Button>
                </div>
                <div className="space-y-4">
                    {keys.map(k => (
                        <div key={k.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                                    {k.name}
                                    <Badge variant={k.status === 'active' ? 'success' : 'danger'} className="ml-2 lowercase">{k.status}</Badge>
                                </div>
                                <div className="text-xs text-slate-500 font-mono mt-1">{k.prefix}•••••••••••••</div>
                                <div className="text-[10px] text-slate-400 mt-2 flex space-x-3">
                                    <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>Limit: {k.rateLimit} req/min</span>
                                    <span>•</span>
                                    <span>Usage: {k.usageCount}</span>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => toggleKeyStatus(k.id, k.status)}>
                                    {k.status === 'active' ? <Pause size={14}/> : <Play size={14}/>}
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => { setKeys(keys.filter(x => x.id !== k.id)); addToast('success', 'Deleted'); }}><Trash2 size={14}/></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Webhooks */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Webhooks</h3>
                        <p className="text-sm text-slate-500">Receive real-time events to your backend.</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setShowWebhookModal(true)}><Plus size={16} className="mr-2"/> Add Endpoint</Button>
                </div>
                <div className="space-y-4">
                    {webhooks.length === 0 && <p className="text-center text-sm text-slate-500 py-4">No webhooks configured.</p>}
                    {webhooks.map(w => (
                        <div key={w.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-mono text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">{w.url}</div>
                                    <div className="flex gap-2 mt-2">
                                        {w.events.map(e => <Badge key={e} variant="brand">{e}</Badge>)}
                                    </div>
                                    <div className="mt-2 text-xs text-slate-500">Secret: <span className="font-mono">{w.secret.substring(0,8)}...</span></div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => testWebhook(w.id)}>Test</Button>
                                    <Button size="sm" variant="danger" onClick={() => deleteWebhook(w.id)}><Trash2 size={14}/></Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Key Modal */}
            <Modal isOpen={showKeyModal} onClose={() => {setShowKeyModal(false); setNewKeyToken(null);}} title="Create API Key">
                {!newKeyToken ? (
                    <div className="space-y-4">
                        <Input label="Key Name" placeholder="e.g. CI/CD Runner" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Permissions</label>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2"><input type="checkbox" checked readOnly className="rounded border-slate-700" /> <span className="text-sm">Read Access</span></label>
                                <label className="flex items-center space-x-2"><input type="checkbox" className="rounded border-slate-700" /> <span className="text-sm">Write Access</span></label>
                            </div>
                        </div>
                        <Button className="w-full" onClick={createKey} disabled={!newKeyName}>Generate Key</Button>
                    </div>
                ) : (
                    <div className="space-y-4 text-center">
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-lg text-sm">Key generated successfully!</div>
                        <p className="text-sm text-slate-500">Copy this key now. You won't be able to see it again.</p>
                        <div className="flex items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <code className="flex-1 font-mono text-xs text-left truncate text-slate-300">{newKeyToken}</code>
                            <button onClick={copyToken} className="text-slate-500 hover:text-white"><Copy size={16}/></button>
                        </div>
                        <Button className="w-full" onClick={() => {setShowKeyModal(false); setNewKeyToken(null); setNewKeyName('');}}>Done</Button>
                    </div>
                )}
            </Modal>

            {/* Webhook Modal */}
            <Modal isOpen={showWebhookModal} onClose={() => setShowWebhookModal(false)} title="Add Webhook Endpoint">
                <div className="space-y-4">
                    <Input label="Endpoint URL" placeholder="https://api.yourapp.com/webhooks" value={newWebhookUrl} onChange={e => setNewWebhookUrl(e.target.value)} />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Events</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['tunnel.connected', 'tunnel.disconnected', 'billing.invoice.paid', 'billing.failed'].map(ev => (
                                <label key={ev} className="flex items-center space-x-2 p-2 border border-slate-700 rounded hover:bg-slate-800 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={newWebhookEvents.includes(ev)}
                                        onChange={e => {
                                            if (e.target.checked) setNewWebhookEvents([...newWebhookEvents, ev]);
                                            else setNewWebhookEvents(newWebhookEvents.filter(x => x !== ev));
                                        }}
                                        className="rounded border-slate-700" 
                                    /> 
                                    <span className="text-xs">{ev}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <Button className="w-full" onClick={createWebhook} disabled={!newWebhookUrl}>Add Endpoint</Button>
                </div>
            </Modal>
        </div>
    );
};

const BillingSettings: React.FC<{ user: any, updateUser: any }> = ({ user, updateUser }) => {
    const { addToast } = useToast();
    const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
    
    useEffect(() => { apiClient.getBillingHistory().then(setInvoices).catch(() => {}); }, []);

    const currentPlan = PLANS[user.plan as keyof typeof PLANS];

    const handleManageSub = async () => {
        addToast('info', 'Redirecting to Billing Portal...');
        const { url } = await apiClient.createPortalSession();
        // In a real app: window.location.href = url;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Billing & Plans</h2>
                <p className="text-slate-500 text-sm">Manage your subscription and payment methods.</p>
            </div>

            <Card className="p-6 bg-gradient-to-br from-brand-900/50 to-slate-900 border-brand-500/30">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-sm text-brand-400 font-bold uppercase tracking-wider mb-1">Current Plan</div>
                        <h3 className="text-3xl font-bold text-white mb-2">{currentPlan.name}</h3>
                        <p className="text-slate-400">${currentPlan.price}/mo • {currentPlan.devices} Devices</p>
                    </div>
                    {user.plan === 'free' ? <Button>Upgrade Now</Button> : <Button variant="outline" onClick={handleManageSub}>Manage Subscription</Button>}
                </div>
            </Card>

            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-900 dark:text-white">Invoice History</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500"><tr><th className="p-4">Date</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4 text-right">Invoice</th></tr></thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {invoices.map(inv => (
                            <tr key={inv.id}>
                                <td className="p-4">{inv.date}</td>
                                <td className="p-4 font-mono">${(inv.amount / 100).toFixed(2)}</td>
                                <td className="p-4"><Badge variant="success">{inv.status}</Badge></td>
                                <td className="p-4 text-right"><button onClick={() => addToast('success', 'Downloading Invoice...')} className="text-brand-500 hover:underline flex items-center justify-end w-full"><FileText size={14} className="mr-1"/> PDF</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

const NotificationSettings: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
                <p className="text-slate-500 text-sm">Choose what we contact you about.</p>
            </div>
            <Card className="divide-y divide-slate-200 dark:divide-slate-800">
                {[
                    { title: 'Security Alerts', desc: 'Login attempts, password changes, and API key events.', active: true },
                    { title: 'Billing Emails', desc: 'Invoices, payment failures, and renewals.', active: true },
                    { title: 'Product Updates', desc: 'New features and improvements.', active: false },
                    { title: 'Marketing', desc: 'Tips, offers, and promotions.', active: false },
                ].map((n, i) => (
                    <div key={i} className="p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{n.title}</h3>
                            <p className="text-sm text-slate-500">{n.desc}</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${n.active ? 'bg-brand-500' : 'bg-slate-700'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${n.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                ))}
            </Card>
        </div>
    );
};

const LogsSettings: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

    useEffect(() => { apiClient.getAuditLogs().then(setLogs).catch(() => {}); }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Activity Log</h2>
                <p className="text-slate-500 text-sm">A detailed record of actions taken on your account.</p>
            </div>
            <Card className="overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500"><tr><th className="p-4">Action</th><th className="p-4">Details</th><th className="p-4">Info</th><th className="p-4">Time</th></tr></thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {logs.slice(0, 15).map((log, i) => (
                            <tr key={i} className="hover:bg-slate-800/30 cursor-pointer" onClick={() => setSelectedLog(log)}>
                                <td className="p-4 font-mono text-brand-500">{log.action}</td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">{log.details || '-'}</td>
                                <td className="p-4 text-slate-500 text-xs">
                                    <div className="flex flex-col">
                                        <span>{log.ipAddress || '127.0.0.1'}</span>
                                        <span className="opacity-70">{log.location || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Log Details">
                {selectedLog && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-800 p-3 rounded">
                                <span className="block text-xs text-slate-500">Action</span>
                                <span className="font-mono text-brand-400">{selectedLog.action}</span>
                            </div>
                            <div className="bg-slate-800 p-3 rounded">
                                <span className="block text-xs text-slate-500">Time</span>
                                <span>{new Date(selectedLog.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-800 p-3 rounded">
                                <span className="block text-xs text-slate-500">IP Address</span>
                                <span className="font-mono">{selectedLog.ipAddress}</span>
                            </div>
                            <div className="bg-slate-800 p-3 rounded">
                                <span className="block text-xs text-slate-500">Location</span>
                                <span>{selectedLog.location || 'N/A'}</span>
                            </div>
                            <div className="col-span-2 bg-slate-800 p-3 rounded">
                                <span className="block text-xs text-slate-500">User Agent</span>
                                <span className="break-all">{selectedLog.userAgent || 'Unknown Device'}</span>
                            </div>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-500 mb-1">Full Context</span>
                            <pre className="bg-slate-950 p-3 rounded text-xs text-slate-400 overflow-x-auto">
                                {JSON.stringify(selectedLog, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
