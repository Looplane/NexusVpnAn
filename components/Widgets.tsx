
import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Map as MapIcon, ShieldCheck, Activity, Globe, Wifi, Cpu, Database, Search, Command, Laptop, Smartphone, Gift, ArrowRight, Shield, XCircle, EyeOff, MapPin, BarChart3, Zap, Signal } from 'lucide-react';
import { Card, Badge, Input, Button } from './UI';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../contexts';

// --- Live Console Widget ---
export const LiveConsole: React.FC = () => {
  const [logs, setLogs] = useState<string[]>(['> NexusVPN System Initialized...']);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messages = [
      'handshake initiation with peer [a82...]',
      'keepalive packet received from 10.100.0.5',
      're-keying active tunnel',
      'bandwidth threshold monitor: stable',
      'gateway health check: success (12ms)',
      'peer roaming: updating endpoint to 192.168.1.1',
      'encryption handshake completed',
      'rotating ephemeral keys'
    ];

    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      setLogs(prev => {
        const newLogs = [...prev, `[${timestamp}] ${msg}`];
        if (newLogs.length > 20) return newLogs.slice(newLogs.length - 20);
        return newLogs;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full font-mono text-[10px] leading-relaxed text-emerald-500 p-4 bg-black">
      <div className="mb-2 pb-2 border-b border-slate-800 flex justify-between items-center opacity-70">
        <span className="text-xs text-slate-400">SYSTEM_LOGS</span>
        <div className="flex space-x-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-auto scrollbar-hide">
        {logs.map((log, i) => (
          <div key={i} className="mb-1 opacity-90 hover:opacity-100 transition-opacity cursor-default">{log}</div>
        ))}
      </div>
    </div>
  );
};

// --- Cyber Map Widget (Enhanced) ---
export const WorldMapWidget: React.FC<{ selectedLocation?: string; isConnected?: boolean }> = ({ selectedLocation, isConnected }) => {
  return (
    <Card className="h-64 relative bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden group shadow-inner">
      {/* Map Background - Adaptive */}
      <div className="absolute inset-0 opacity-10 dark:opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center dark:filter dark:grayscale dark:brightness-125 dark:contrast-125 filter grayscale"></div>
      
      {/* Overlay Gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-200/50 dark:from-slate-900/90 via-transparent to-transparent"></div>
      
      {/* Dynamic Markers */}
      {[
          { id: 'us-west', top: '35%', left: '20%', label: 'US West', ip: '104.16.0.2' },
          { id: 'us-east', top: '32%', left: '28%', label: 'New York', ip: '104.16.0.1' }, // Approximate
          { id: 'eu-de', top: '28%', left: '49%', label: 'Frankfurt', ip: '172.67.0.1' },
          { id: 'asia-jp', top: '35%', left: '82%', label: 'Tokyo', ip: '172.67.0.2' },
      ].map(marker => (
          <div key={marker.id} className="absolute group/marker" style={{ top: marker.top, left: marker.left }}>
            <div className="relative flex items-center justify-center">
                {/* Ping/Halo Animation when Active */}
                {(selectedLocation === marker.id && isConnected) && (
                    <div className="absolute w-12 h-12 bg-emerald-500/20 rounded-full animate-ping"></div>
                )}
                
                {/* Marker Dot */}
                <div className={`w-3 h-3 rounded-full z-10 transition-all duration-500 border-2 ${
                    selectedLocation === marker.id 
                    ? isConnected ? 'bg-emerald-500 border-emerald-300 scale-125 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-brand-500 border-brand-300 scale-110'
                    : 'bg-slate-400 dark:bg-slate-600 border-white dark:border-slate-800'
                }`}></div>
                
                {/* Tooltip */}
                <div className={`absolute bottom-full mb-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl rounded-lg px-3 py-2 whitespace-nowrap z-20 transition-all transform origin-bottom scale-90 opacity-0 group-hover/marker:scale-100 group-hover/marker:opacity-100 ${selectedLocation === marker.id ? 'opacity-100 scale-100' : ''}`}>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{marker.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{marker.ip}</div>
                    {(selectedLocation === marker.id && isConnected) && <div className="text-[10px] text-emerald-500 font-bold mt-1">SECURE CONNECTION</div>}
                </div>
            </div>
          </div>
      ))}
      
      {/* Connection Line Visualization */}
      {isConnected && (
          <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full opacity-60">
                  <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                          <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                  </defs>
                  {/* Simplified curve representing connection flow - purely visual */}
                  <path d="M 100 200 Q 400 50 700 200" fill="none" stroke="url(#lineGradient)" strokeWidth="2" className="animate-[dash_3s_linear_infinite]" strokeDasharray="10,10" />
              </svg>
          </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        <div>
            <h3 className="text-slate-700 dark:text-white font-bold flex items-center text-sm"><Globe size={14} className="mr-2 text-brand-500" /> Global Network</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">7 Active Regions • 99.9% Uptime</p>
        </div>
        <Badge variant={isConnected ? 'success' : 'neutral'} className="shadow-sm border bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
            {isConnected ? 'ENCRYPTED' : 'READY'}
        </Badge>
      </div>
    </Card>
  );
};

// --- Health Status Widget ---
export const HealthWidget: React.FC = () => {
  return (
    <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
        <Activity size={16} className="mr-2 text-rose-500" /> System Health
      </h3>
      <div className="space-y-3">
        {[
          { label: 'API Latency', value: '24ms', icon: Wifi, color: 'text-emerald-500' },
          { label: 'CPU Load', value: '12%', icon: Cpu, color: 'text-brand-500' },
          { label: 'DB Connections', value: '45/100', icon: Database, color: 'text-indigo-500' },
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center text-xs">
            <div className="flex items-center text-slate-500">
              <item.icon size={12} className="mr-2" /> {item.label}
            </div>
            <span className={`font-mono font-bold ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

// --- Command Palette ---
export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      <div className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search size={20} className="text-slate-400" />
          <input 
            className="w-full bg-transparent border-none py-4 px-4 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-0 text-lg"
            placeholder="Type a command or search..."
            autoFocus
          />
          <Badge variant="neutral">ESC</Badge>
        </div>
        <div className="py-2">
          <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</div>
          {['Go to Dashboard', 'Go to Settings', 'View Logs', 'Generate Config'].map((item, i) => (
            <div key={i} className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center group">
              <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{item}</span>
              <span className="text-slate-500 text-xs">Jump</span>
            </div>
          ))}
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span className="flex items-center"><Command size={10} className="mr-1" /> K to open</span>
            <span>NexusVPN Command v1.0</span>
        </div>
      </div>
    </div>
  );
};

// --- RESTORED: Device Status Widget ---
export const DeviceStatusWidget: React.FC = () => {
    const { user } = useAuth();
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        apiClient.getActiveSessions().then(s => setCount(s.length)).catch(() => {});
    }, []);

    const maxDevices = user?.plan === 'free' ? 1 : user?.plan === 'basic' ? 5 : 10;
    const percentage = (count / maxDevices) * 100;

    return (
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Active Devices</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Plan Limit: {maxDevices}</p>
                </div>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500">
                    <Laptop size={18} />
                </div>
            </div>
            <div className="flex items-end justify-between mb-3">
                <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{count}</span>
                <span className="text-xs font-medium text-slate-500 mb-1">{maxDevices - count} slots available</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
            </div>
        </Card>
    );
};

// --- RESTORED: Data Usage Widget ---
export const DataUsageWidget: React.FC = () => {
    // Mocking specific numbers to match the "Revert" request visually
    const usedGB = 1.54;
    const totalGB = 10; // For free plan maybe
    const percentage = (usedGB / totalGB) * 100;

    return (
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Usage</h3>
                <BarChart3 size={16} className="text-brand-500" />
            </div>
            <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{usedGB} <span className="text-sm font-normal text-slate-500">GB</span></span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-brand-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
            <div className="text-right text-xs text-slate-400">Reset in 12 days</div>
        </Card>
    );
};

// --- NEW EXTENSION: Connection Quality Widget ---
export const ConnectionQualityWidget: React.FC = () => {
    return (
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                <Signal size={14} className="mr-2" /> Connection Quality
            </h3>
            <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                    <span className="text-xs text-slate-400 mb-1">Stability</span>
                    <span className="text-emerald-500 font-bold">99%</span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-slate-400 mb-1">Packet Loss</span>
                    <span className="text-slate-900 dark:text-white font-bold">0.01%</span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-slate-400 mb-1">Score</span>
                    <Badge variant="success">A+</Badge>
                </div>
            </div>
        </Card>
    );
};

// --- Referral Widget ---
export const ReferralWidget: React.FC = () => {
    const [credits, setCredits] = useState(0);

    useEffect(() => {
        apiClient.getReferralStats().then(s => setCredits(s.totalEarned)).catch(() => {});
    }, []);

    return (
        <Card className="p-4 bg-gradient-to-br from-brand-600 to-indigo-700 border-none text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex justify-between items-center relative z-10">
                <div>
                    <div className="text-xs font-medium text-brand-100 uppercase tracking-wide mb-1">Available Credit</div>
                    <div className="text-2xl font-bold">${(credits / 100).toFixed(2)}</div>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                    <Gift size={20} />
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-brand-100">Invite friends & earn</span>
                <button className="flex items-center font-bold hover:underline">Get Link <ArrowRight size={10} className="ml-1"/></button>
            </div>
        </Card>
    );
};

// --- NEW: CyberShield Widget ---
export const CyberShieldWidget: React.FC = () => {
    return (
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                    <ShieldCheck size={16} className="text-emerald-500 mr-2" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">CyberShield</h3>
                </div>
                <Badge variant="success">ACTIVE</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center"><XCircle size={10} className="mr-1"/> Ads</div>
                    <div className="text-lg font-bold text-slate-800 dark:text-white">42</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center"><EyeOff size={10} className="mr-1"/> Trackers</div>
                    <div className="text-lg font-bold text-slate-800 dark:text-white">128</div>
                </div>
            </div>
        </Card>
    );
};

// --- NEW: IP History Widget ---
export const IpHistoryWidget: React.FC = () => {
    const history = [
        { ip: '104.16.0.1', loc: 'New York, US', time: 'Now' },
        { ip: '172.67.0.1', loc: 'Frankfurt, DE', time: '2h ago' },
        { ip: '45.76.12.9', loc: 'Home ISP', time: '1d ago' }
    ];

    return (
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                    <MapPin size={16} className="mr-2 text-brand-500" /> Recent IPs
                </h3>
            </div>
            <div className="space-y-2">
                {history.map((h, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                        <div className="flex items-center">
                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${i === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                            <span className="font-mono text-slate-600 dark:text-slate-300">{h.ip}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-slate-500 truncate w-20 text-right">{h.loc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
