
import React, { useEffect, useState } from 'react';
import { useAuth, useToast } from '../contexts';
import { apiClient } from '../services/apiClient';
import { ServerLocation, VpnConfig, ConnectionLog, ActiveSession } from '../types';
import { Button, Card, Badge, Modal, Input, Drawer, Tooltip } from '../components/UI';
import { LiveConsole, WorldMapWidget, HealthWidget, DeviceStatusWidget, DataUsageWidget, ReferralWidget, CyberShieldWidget, IpHistoryWidget, ConnectionQualityWidget } from '../components/Widgets';
import { Download, Globe, Key, Trash2, ChevronDown, ChevronUp, Settings, BarChart3, Clock, ShieldCheck, Laptop, Smartphone, Monitor, Wifi, RefreshCw, Zap, Power, Lock, Layers, EyeOff, Radio, Timer, ArrowRight, Activity, Network, Fingerprint, ToggleLeft, ToggleRight, Info, Route, ArrowDown, ArrowUp } from 'lucide-react';
import QRCode from 'react-qr-code';
import { SpeedTest } from '../components/SpeedTest';
import { UsageChart } from '../components/UsageChart';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [locations, setLocations] = useState<ServerLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [connectedServerId, setConnectedServerId] = useState<string | null>(null);
  const [connTime, setConnTime] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [usage, setUsage] = useState<any>(null);
  
  const [protocol, setProtocol] = useState<'wireguard' | 'openvpn' | 'ikev2'>('wireguard');
  const [isKillSwitch, setIsKillSwitch] = useState(false);
  const [isStealth, setIsStealth] = useState(false);

  const [splitTunneling, setSplitTunneling] = useState<{ [key: string]: boolean }>({ Netflix: true, Banking: false, Local: false });
  const [leakProtection, setLeakProtection] = useState({ dns: true, webrtc: true, ipv6: false });
  
  const [isMultiHopEnabled, setIsMultiHopEnabled] = useState(false);
  const [multiHopRoute, setMultiHopRoute] = useState({ entry: 'US East', exit: 'Switzerland' });
  const [showHopModal, setShowHopModal] = useState(false);

  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);

  const [generatedConfig, setGeneratedConfig] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const fetchAllData = async () => {
      try {
          const [locs, usageData, deviceList, connLogs, activeSess] = await Promise.all([
              apiClient.getLocations(),
              apiClient.getUsageHistory(),
              apiClient.getUserDevices(),
              apiClient.getConnectionLogs(),
              apiClient.getActiveSessions()
          ]);
          setLocations(locs);
          setUsage(usageData);
          setLogs(connLogs);
          setSessions(activeSess);
          if (!selectedLocationId && locs.length > 0) setSelectedLocationId(locs[0].id);
      } catch (e) {
          console.warn("Fetch error", e);
      }
  };

  useEffect(() => {
      fetchAllData();
      const interval = setInterval(fetchAllData, 10000); 
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      let interval: any;
      if (connectionStatus === 'connected') {
          interval = setInterval(() => setConnTime(p => p + 1), 1000);
      } else {
          setConnTime(0);
      }
      return () => clearInterval(interval);
  }, [connectionStatus]);

  const formatTime = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleConnectionToggle = () => {
      if (connectionStatus === 'connected') {
          setConnectionStatus('disconnected');
          setConnectedServerId(null);
          addToast('info', 'VPN Disconnected');
      } else {
          if (!selectedLocationId) return addToast('error', 'Please select a server first');
          setConnectionStatus('connecting');
          setTimeout(() => {
              setConnectionStatus('connected');
              setConnectedServerId(selectedLocationId);
              addToast('success', 'Secure Tunnel Established');
          }, 1500);
      }
  };

  const handleGenerateConfig = async () => {
    if (!user || !selectedLocationId) return;
    setIsGenerating(true);
    try {
      const configContent = await apiClient.generateConfig(selectedLocationId);
      setGeneratedConfig(configContent);
      setShowConfigModal(true);
      addToast('success', 'Configuration generated successfully!');
      fetchAllData();
    } catch (err) {
      addToast('error', 'Failed to generate configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFile = () => {
    if (!generatedConfig || !selectedLocationId || !user) return;
    const blob = new Blob([generatedConfig], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexusvpn-${selectedLocationId}-${user.id.substring(0,6)}.conf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleSplitApp = (app: string) => setSplitTunneling(p => ({ ...p, [app]: !p[app] }));
  const toggleLeak = (key: keyof typeof leakProtection) => setLeakProtection(p => ({ ...p, [key]: !p[key] }));

  if (!user) return null;

  const displayLocationId = connectionStatus === 'connected' ? connectedServerId : selectedLocationId;
  const displayLocation = locations.find(l => l.id === displayLocationId);
  const currentLocationName = displayLocation?.city || 'Select Server';
  const currentCountryCode = displayLocation?.countryCode.toLowerCase() || 'us';
  const displayIP = displayLocation?.ipv4 || '---.---.---.---';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mission Control</h1>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1 space-x-2">
             <span>Plan: <span className="font-semibold text-brand-500 capitalize">{user.plan}</span></span>
             <span className="text-slate-300 dark:text-slate-600">|</span>
             <span>ID: <span className="font-mono">{user.id.substring(0,8)}</span></span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
           <div className={`px-4 py-2.5 rounded-lg flex items-center font-medium transition-all border shadow-sm ${connectionStatus === 'connected' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
               {connectionStatus === 'connected' ? (
                   <div className="flex items-center space-x-4">
                       <div className="flex items-center">
                           <span className="relative flex h-3 w-3 mr-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                           <span className={`fi fi-${currentCountryCode} mr-2 rounded-sm shadow-sm text-lg`}></span>
                           <span className="font-bold">{currentLocationName}</span>
                       </div>
                       <div className="h-4 w-px bg-current opacity-20 mx-2"></div>
                       <div className="flex items-center font-mono text-xs opacity-90 space-x-2">
                           <Clock size={12} />
                           <span>{formatTime(connTime)}</span>
                       </div>
                       <div className="h-4 w-px bg-current opacity-20 mx-2"></div>
                       <div className="flex items-center text-xs space-x-1 font-mono">
                           <Globe size={12} />
                           <span>{displayIP}</span>
                       </div>
                   </div>
               ) : (
                   <div className="flex items-center">
                        <Power size={16} className="mr-2" />
                        <span>Disconnected</span>
                   </div>
               )}
           </div>
           <button 
                onClick={handleConnectionToggle}
                disabled={connectionStatus === 'connecting'}
                className={`px-6 py-2.5 rounded-lg font-bold shadow-lg transition-all flex items-center text-white min-w-[160px] justify-center ${
                    connectionStatus === 'connected' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 
                    connectionStatus === 'connecting' ? 'bg-slate-400 cursor-not-allowed' :
                    'bg-brand-600 hover:bg-brand-500 shadow-brand-500/20'
                }`}
            >
               {connectionStatus === 'connected' ? 'Disconnect' : connectionStatus === 'connecting' ? 'Connecting...' : `Connect to ${currentLocationName}`}
           </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 mb-8">
          
          {/* Left Col - Server List */}
          <div className="col-span-12 lg:col-span-3 flex flex-col space-y-6">
              <Card className="flex-1 flex flex-col p-0 border-brand-500/30 shadow-lg shadow-brand-500/5 relative overflow-hidden h-[500px]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-indigo-500"></div>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center uppercase tracking-wider">
                          <Globe className="mr-2 text-brand-500" size={16} /> Server Nodes
                      </h2>
                  </div>
                  <div className="p-2 flex-1 flex flex-col overflow-hidden">
                      <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-1">
                          {locations.map((loc) => {
                              const isSelected = selectedLocationId === loc.id;
                              const isActive = connectionStatus === 'connected' && connectedServerId === loc.id;
                              
                              return (
                                <button 
                                    key={loc.id} 
                                    onClick={() => !loc.premium || user.plan !== 'free' ? setSelectedLocationId(loc.id) : null} 
                                    disabled={loc.premium && user.plan === 'free'}
                                    className={`w-full flex items-center p-3 rounded-lg border text-left transition-all group relative ${
                                        isActive ? 'bg-emerald-500/10 border-emerald-500/50' :
                                        isSelected ? 'bg-brand-600 text-white border-brand-600 shadow-md' : 
                                        'bg-white dark:bg-slate-800/40 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <span className={`fi fi-${loc.countryCode.toLowerCase()} mr-3 text-lg rounded-sm shadow-sm`}></span> 
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-bold text-xs truncate ${isSelected && !isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                            {loc.city}
                                            {isActive && <span className="ml-2 text-[10px] bg-emerald-500 text-white px-1 rounded">CONNECTED</span>}
                                        </div>
                                        <div className={`text-[10px] ${isSelected && !isActive ? 'text-brand-100' : 'text-slate-500 dark:text-slate-400'}`}>{loc.ping}ms • {loc.load}% Load</div>
                                    </div>
                                    {loc.premium && user.plan === 'free' && <Lock size={12} className="text-amber-500 ml-2" />}
                                </button>
                              );
                          })}
                      </div>
                  </div>
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                      <Button onClick={handleGenerateConfig} isLoading={isGenerating} disabled={!selectedLocationId} className="w-full shadow-brand-500/25">
                          <Download className="mr-2 h-4 w-4" /> Get Config
                      </Button>
                  </div>
              </Card>
              
              <HealthWidget />
          </div>

          {/* Center Col - Map, Traffic & Controls */}
          <div className="col-span-12 lg:col-span-6 flex flex-col space-y-6">
              <WorldMapWidget selectedLocation={displayLocationId} isConnected={connectionStatus === 'connected'} />
              
              {/* Traffic Activity (Redesigned) */}
              <Card className="p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 min-h-[220px] overflow-hidden">
                  {/* Traffic Header HUD */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                          <div className="flex items-center text-slate-900 dark:text-white">
                              <Activity size={18} className="mr-2 text-brand-500" />
                              <span className="font-bold text-sm uppercase tracking-wide">Network Monitor</span>
                          </div>
                          <Badge variant="success" className="animate-pulse">LIVE</Badge>
                      </div>
                      <div className="flex space-x-4 text-xs font-mono">
                          <div className="flex items-center text-emerald-500">
                              <ArrowDown size={14} className="mr-1" />
                              <span className="font-bold">4.2 MB/s</span>
                          </div>
                          <div className="flex items-center text-indigo-500">
                              <ArrowUp size={14} className="mr-1" />
                              <span className="font-bold">1.8 MB/s</span>
                          </div>
                      </div>
                  </div>
                  
                  {/* Detailed Stats Row */}
                  <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="p-3 text-center">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Download</div>
                          <div className="text-lg font-bold text-slate-800 dark:text-white">1.2 <span className="text-xs text-slate-500">GB</span></div>
                      </div>
                      <div className="p-3 text-center">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Upload</div>
                          <div className="text-lg font-bold text-slate-800 dark:text-white">450 <span className="text-xs text-slate-500">MB</span></div>
                      </div>
                      <div className="p-3 text-center">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Session Time</div>
                          <div className="text-lg font-bold text-slate-800 dark:text-white font-mono">{formatTime(connTime)}</div>
                      </div>
                  </div>

                  <div className="p-4 pt-0 h-40">
                      <UsageChart data={usage?.history || []} />
                  </div>
              </Card>

              {/* System Logs */}
              <div className="h-48 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-indigo-600 rounded-xl opacity-30 blur group-hover:opacity-60 transition duration-1000"></div>
                  <div className="relative h-full bg-black rounded-xl overflow-hidden border border-slate-800">
                      <LiveConsole />
                  </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div onClick={() => setIsKillSwitch(!isKillSwitch)} className={`p-3 rounded-xl border cursor-pointer transition-all ${isKillSwitch ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                      <div className="flex items-center justify-between mb-2"><ShieldCheck size={20} /><div className={`w-2 h-2 rounded-full ${isKillSwitch ? 'bg-red-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></div></div>
                      <div className="text-xs font-bold">Kill Switch</div>
                  </div>
                  <div onClick={() => setIsStealth(!isStealth)} className={`p-3 rounded-xl border cursor-pointer transition-all ${isStealth ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                      <div className="flex items-center justify-between mb-2"><EyeOff size={20} /><div className={`w-2 h-2 rounded-full ${isStealth ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></div></div>
                      <div className="text-xs font-bold">Stealth Mode</div>
                  </div>
                  <div className="col-span-2 p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
                      <div className="flex items-center text-slate-500 dark:text-slate-400"><Layers size={20} className="mr-3" /><div className="text-xs font-bold">Protocol</div></div>
                      <div className="flex bg-slate-100 dark:bg-slate-950 rounded-lg p-1">
                          {['wireguard', 'openvpn'].map(p => (
                              <button key={p} onClick={() => setProtocol(p as any)} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${protocol === p ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow' : 'text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'}`}>{p}</button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>

          {/* Right Col - Stats & Multi-Hop (Restored Widgets) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col space-y-6">
              
              {/* Multi-Hop (Clean Card) */}
              <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-visible relative group">
                  <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                          <Route size={16} className="text-indigo-500 mr-2" />
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Double VPN</h3>
                      </div>
                      <div onClick={() => user.plan !== 'free' && setIsMultiHopEnabled(!isMultiHopEnabled)} className={`cursor-pointer transition-colors ${user.plan === 'free' ? 'opacity-50' : ''}`}>
                          {isMultiHopEnabled ? <ToggleRight size={28} className="text-brand-500" /> : <ToggleLeft size={28} className="text-slate-400" />}
                      </div>
                  </div>
                  
                  {isMultiHopEnabled ? (
                      <div className="animate-in fade-in zoom-in-95 duration-200">
                          <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex-1 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-center relative overflow-hidden">
                                  <div className="text-[9px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Entry</div>
                                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate flex justify-center items-center">
                                      <span className="fi fi-us rounded-sm mr-1"></span> {multiHopRoute.entry}
                                  </div>
                                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500/50"></div>
                              </div>
                              <div className="text-slate-300 dark:text-slate-600 flex justify-center w-6">
                                  <ArrowRight size={14} className="animate-[pulse_1.5s_infinite] text-brand-500" />
                              </div>
                              <div className="flex-1 p-2 bg-slate-50 dark:bg-slate-950 border border-brand-500/30 rounded-lg text-center relative overflow-hidden">
                                  <div className="text-[9px] text-brand-500 uppercase font-bold mb-1 tracking-wider">Exit</div>
                                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate flex justify-center items-center">
                                      <span className="fi fi-ch rounded-sm mr-1"></span> {multiHopRoute.exit}
                                  </div>
                                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500"></div>
                              </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setShowHopModal(true)}>
                              Change Route
                          </Button>
                      </div>
                  ) : (
                      <div className="text-center py-4">
                          <p className="text-xs text-slate-500 mb-3">Route traffic through two locations for extra privacy.</p>
                          {user.plan === 'free' ? (
                              <p className="text-[10px] text-amber-500 font-bold bg-amber-50 dark:bg-amber-900/20 py-1 px-2 rounded inline-block">Upgrade to Pro</p>
                          ) : (
                              <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setShowHopModal(true)}>
                                  Configure Route
                              </Button>
                          )}
                      </div>
                  )}
              </Card>

              {/* RESTORED: Active Devices & Data Usage */}
              <DeviceStatusWidget />
              <DataUsageWidget />

              {/* Speed Test */}
              <SpeedTest />
              
              {/* Connection Quality */}
              <ConnectionQualityWidget />

              {/* CyberShield */}
              <CyberShieldWidget />

              {/* Referral */}
              <ReferralWidget />
              
              {/* Recent IPs */}
              <IpHistoryWidget />
          </div>
      </div>

      {/* Advanced Features Panel */}
      <div className="mb-12">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center"><Settings size={18} className="mr-2 text-slate-500"/> Advanced Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-start justify-between mb-4">
                      <div><div className="font-bold text-slate-900 dark:text-white">Split Tunneling</div><div className="text-xs text-slate-500 mt-1">Select apps to bypass VPN</div></div>
                      <Radio size={20} className="text-slate-400 dark:text-slate-600" />
                  </div>
                  <div className="space-y-2">
                      {Object.keys(splitTunneling).map((app) => (
                          <div key={app} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer" onClick={() => toggleSplitApp(app)}>
                              <span className="text-xs text-slate-700 dark:text-slate-300">{app}</span>
                              <div className={`w-8 h-4 rounded-full relative transition-colors ${splitTunneling[app] ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-800'}`}>
                                  <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${splitTunneling[app] ? 'left-5' : 'left-1'}`}></div>
                              </div>
                          </div>
                      ))}
                  </div>
              </Card>

              <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-start justify-between mb-4">
                      <div><div className="font-bold text-slate-900 dark:text-white">Leak Protection</div><div className="text-xs text-slate-500 mt-1">Prevent accidental exposure</div></div>
                      <ShieldCheck size={20} className="text-emerald-500" />
                  </div>
                  <div className="space-y-3 mt-4">
                      {[{k: 'dns', l: 'DNS Leak Guard'}, {k: 'webrtc', l: 'WebRTC Shield'}, {k: 'ipv6', l: 'IPv6 Disable'}].map((item) => (
                          <div key={item.k} className="flex justify-between items-center cursor-pointer" onClick={() => toggleLeak(item.k as any)}>
                              <span className="text-sm text-slate-700 dark:text-slate-300">{item.l}</span>
                              <Badge variant={leakProtection[item.k as keyof typeof leakProtection] ? 'success' : 'warning'}>
                                  {leakProtection[item.k as keyof typeof leakProtection] ? 'ACTIVE' : 'OFF'}
                              </Badge>
                          </div>
                      ))}
                  </div>
              </Card>
          </div>
      </div>

      {/* Connection Logs Table */}
      <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Connection History</h3>
              <Button variant="ghost" size="sm">Export CSV</Button>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950">
                      <tr className="text-left text-slate-500 text-xs uppercase tracking-wider font-semibold">
                          <th className="px-6 py-4">Server</th>
                          <th className="px-6 py-4">Protocol</th>
                          <th className="px-6 py-4">Device Info</th>
                          <th className="px-6 py-4">Client IP / Server IP</th>
                          <th className="px-6 py-4">Time</th>
                          <th className="px-6 py-4">Data</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {logs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4">
                                  <div className="font-medium text-slate-700 dark:text-slate-300">{log.serverCity}</div>
                                  <div className="text-xs text-slate-500">ID: {log.serverId}</div>
                              </td>
                              <td className="px-6 py-4">
                                  <Badge variant="neutral">WireGuard</Badge>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                                      <Smartphone size={14} className="mr-2" />
                                      {log.device}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1 flex items-center">
                                      <Fingerprint size={10} className="mr-1" />
                                      fp_{log.id.substring(0,6)}
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono">
                                  <div className="flex items-center text-emerald-600 dark:text-emerald-400 mb-1">
                                      <ArrowRight size={12} className="mr-1" /> {displayIP.replace(/\d+$/, 'x')}
                                  </div>
                                  <div className="flex items-center text-slate-500">
                                      <Globe size={12} className="mr-1" /> {displayIP}
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-slate-500">
                                  <div>{new Date(log.connectedAt).toLocaleDateString()}</div>
                                  <div className="text-xs">{new Date(log.connectedAt).toLocaleTimeString()}</div>
                                  <div className="text-xs text-slate-400 mt-1">Duration: {log.duration}</div>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs text-brand-600 dark:text-brand-400 font-bold">{log.dataTransferred}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Config Modal */}
      <Modal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} title="Secure Configuration">
        <div className="space-y-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Scan with WireGuard mobile app to import.</p>
          <div className="bg-white p-4 rounded-xl inline-block border border-slate-200 shadow-inner">
             {generatedConfig && <QRCode size={200} value={generatedConfig} />}
          </div>
          <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-900 text-slate-500">OR</span></div></div>
          <Button onClick={downloadFile} className="w-full"><Download className="mr-2 h-4 w-4" /> Download .conf File</Button>
        </div>
      </Modal>

      {/* Multi Hop Detail Modal */}
      <Modal isOpen={showHopModal} onClose={() => setShowHopModal(false)} title="Configure Multi-Hop Route">
          <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg flex items-start gap-3 border border-indigo-100 dark:border-indigo-900/50">
                  <Info className="text-indigo-500 mt-0.5 shrink-0" size={20} />
                  <div>
                      <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">Double Encryption</h4>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">
                          Your traffic is encrypted twice. The <strong>Entry Node</strong> knows your IP but not your traffic. 
                          The <strong>Exit Node</strong> knows your traffic but not your IP. This provides maximum anonymity.
                      </p>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">1. Entry Node</label>
                      <div className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 cursor-pointer hover:border-brand-500 transition-colors">
                          <div className="flex items-center gap-2">
                              <span className="fi fi-us rounded-sm"></span>
                              <span className="font-bold text-slate-900 dark:text-white">{multiHopRoute.entry}</span>
                          </div>
                      </div>
                  </div>

                  <div className="flex justify-center pt-6">
                      <ArrowRight size={24} className="text-slate-400" />
                  </div>

                  <div className="space-y-2 col-start-2">
                      <label className="text-xs font-bold text-brand-500 uppercase">2. Exit Node</label>
                      <div className="p-3 border border-brand-500 rounded-lg bg-brand-50 dark:bg-brand-900/20 cursor-pointer shadow-sm">
                          <div className="flex items-center gap-2">
                              <span className="fi fi-ch rounded-sm"></span>
                              <span className="font-bold text-slate-900 dark:text-white">{multiHopRoute.exit}</span>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="pt-4">
                  <Button className="w-full" onClick={() => {
                      setIsMultiHopEnabled(true);
                      setShowHopModal(false);
                      addToast('success', `Route applied: ${multiHopRoute.entry} -> ${multiHopRoute.exit}`);
                  }}>
                      Apply Secure Route
                  </Button>
              </div>
          </div>
      </Modal>
    </div>
  );
};
