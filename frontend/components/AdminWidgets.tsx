
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, HardDrive, Wifi, Play, StopCircle, RefreshCw, Save, X, Shield, Plus, Trash2, FileText, AlertTriangle, Search, Filter, Clock, Activity, Download, Upload, AlertCircle, TrendingUp, MessageSquare, PieChart as PieIcon } from 'lucide-react';
import { Card, Button, Badge, Input } from './UI';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { apiClient } from '../services/apiClient';

// --- Remote Terminal Widget ---
export const RemoteTerminal: React.FC<{ serverName: string; ip: string; serverId?: string }> = ({ serverName, ip, serverId }) => {
  const [lines, setLines] = useState<string[]>([
    `Connecting to ${serverName || 'Unknown Host'} (${ip || 'Unknown IP'})...`,
    `Session established via secure tunnel.`,
    `root@${(serverName || 'host').replace(/\s/g, '-').toLowerCase()}:~# _`
  ]);
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExecuting) {
      const cmd = command.trim();
      if (!cmd) return;

      // Update UI with command
      const newLines = [...lines];
      newLines[newLines.length - 1] = newLines[newLines.length - 1].replace('_', cmd);
      setLines(newLines);
      setCommand('');
      setIsExecuting(true);

      if (cmd === 'clear') {
          setLines([`root@${(serverName || 'host').replace(/\s/g, '-').toLowerCase()}:~# _`]);
          setIsExecuting(false);
          return;
      }

      // Execute via API
      try {
          let output = '';
          if (serverId) {
              const res = await apiClient.executeRemoteCommand(serverId, cmd);
              output = res.output;
          } else {
              output = `Error: Server ID missing. Cannot execute remote command.`;
          }
          setLines(prev => [...prev, output, `root@${(serverName || 'host').replace(/\s/g, '-').toLowerCase()}:~# _`]);
      } catch (err) {
          setLines(prev => [...prev, `Error: ${err instanceof Error ? err.message : 'Execution failed'}`, `root@${(serverName || 'host').replace(/\s/g, '-').toLowerCase()}:~# _`]);
      } finally {
          setIsExecuting(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="bg-slate-900 rounded-t-lg font-mono text-xs p-4 flex-1 overflow-y-auto border border-slate-800 shadow-inner text-slate-300">
        {lines.map((line, i) => (
          <div key={i} className={`mb-1 whitespace-pre-wrap ${line.startsWith('root') ? 'text-brand-400' : 'text-slate-300'}`}>
            {line}
          </div>
        ))}
        {isExecuting && <div className="text-slate-500 animate-pulse">Executing...</div>}
      </div>
      <div className="bg-slate-950 p-2 border-t border-slate-800 rounded-b-lg flex items-center">
        <span className="text-brand-500 mr-2">$</span>
        <input 
          autoFocus
          className="bg-transparent border-none outline-none text-slate-200 w-full font-mono text-sm"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command (e.g. uptime, wg show)..."
          disabled={isExecuting}
        />
      </div>
    </div>
  );
};

interface MetricProps {
  label: string;
  value: number; // 0-100
  unit: string;
  icon: any;
  color: string;
  detail?: string;
}

export const MetricCard: React.FC<MetricProps> = ({ label, value, unit, icon: Icon, color, detail }) => {
  return (
    <Card className="p-4 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
          <Icon size={40} />
      </div>
      <div className="flex items-center space-x-3 mb-2">
        <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          <Icon className={color} size={18} />
        </div>
        <div className="text-xs text-slate-500 uppercase font-bold">{label}</div>
      </div>
      <div className="flex items-baseline space-x-1">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
          <div className="text-sm text-slate-500">{unit}</div>
      </div>
      {detail && <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{detail}</div>}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
          <div className={`h-full ${color.replace('text-', 'bg-')}`} style={{ width: `${value}%` }}></div>
      </div>
    </Card>
  );
};

export const AnalyticsWidget: React.FC = () => {
    const data = [...Array(24)].map((_, i) => ({
        time: `${i}:00`,
        inbound: Math.floor(Math.random() * 800) + 200,
        outbound: Math.floor(Math.random() * 500) + 100,
    }));

    return (
        <Card className="p-4 h-72">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <Activity size={16} className="mr-2 text-brand-500" /> Network Traffic (Real-time)
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }} itemStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="inbound" name="Inbound" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} />
                    <Area type="monotone" dataKey="outbound" name="Outbound" stroke="#6366f1" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const UserDistributionChart: React.FC = () => {
    const data = [
        { name: 'Free Tier', value: 400, color: '#94a3b8' },
        { name: 'Basic Plan', value: 300, color: '#0ea5e9' },
        { name: 'Pro Plan', value: 300, color: '#6366f1' },
    ];

    return (
        <Card className="p-4 h-72">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                <PieIcon size={16} className="mr-2 text-indigo-500" /> User Distribution
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }} itemStyle={{color: '#0f172a'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const ServerLoadChart: React.FC = () => {
    const data = [
        { name: 'US-East', load: 85 },
        { name: 'US-West', load: 45 },
        { name: 'EU-DE', load: 60 },
        { name: 'JP-TYO', load: 30 },
        { name: 'UK-LDN', load: 75 },
    ];

    return (
        <Card className="p-4 h-72">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <HardDrive size={16} className="mr-2 text-amber-500" /> Node Load Average
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }} />
                    <Bar dataKey="load" name="Load %" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.load > 80 ? '#ef4444' : entry.load > 60 ? '#f59e0b' : '#10b981'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const RevenueChart: React.FC = () => {
    const data = [
        { name: 'Mon', revenue: 1240 },
        { name: 'Tue', revenue: 1390 },
        { name: 'Wed', revenue: 980 },
        { name: 'Thu', revenue: 1520 },
        { name: 'Fri', revenue: 1890 },
        { name: 'Sat', revenue: 2100 },
        { name: 'Sun', revenue: 1750 },
    ];

    return (
        <Card className="p-6 h-72">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <TrendingUp size={18} className="mr-2 text-emerald-500" /> Revenue Analytics
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', color: '#0f172a' }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                        formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const ServiceControls: React.FC = () => {
    const [status, setStatus] = useState<'running' | 'stopped' | 'restarting'>('running');

    const handleAction = (action: 'start' | 'stop' | 'restart') => {
        if (action === 'restart') {
            setStatus('restarting');
            setTimeout(() => setStatus('running'), 2000);
        } else if (action === 'stop') {
            setStatus('stopped');
        } else {
            setStatus('running');
        }
    };

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">WireGuard Service</h3>
                <Badge variant={status === 'running' ? 'success' : status === 'restarting' ? 'warning' : 'danger'}>
                    {status.toUpperCase()}
                </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant="outline" onClick={() => handleAction('start')} disabled={status === 'running'} className="border-slate-200 dark:border-slate-700">
                    <Play size={14} className="mr-2" /> Start
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction('restart')} disabled={status !== 'running'} className="border-slate-200 dark:border-slate-700">
                    <RefreshCw size={14} className="mr-2" /> Restart
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleAction('stop')} disabled={status === 'stopped'}>
                    <StopCircle size={14} className="mr-2" /> Stop
                </Button>
            </div>
        </Card>
    );
};

export const FirewallManager: React.FC = () => {
    const [rules, setRules] = useState([
        { id: 1, port: '22', proto: 'TCP', action: 'ALLOW', from: 'Anywhere', desc: 'SSH Access' },
        { id: 2, port: '51820', proto: 'UDP', action: 'ALLOW', from: 'Anywhere', desc: 'WireGuard VPN' },
        { id: 3, port: '80', proto: 'TCP', action: 'DENY', from: 'Anywhere', desc: 'HTTP Web' },
    ]);
    const [newPort, setNewPort] = useState('');

    const addRule = () => {
        if (!newPort) return;
        setRules([...rules, { id: Date.now(), port: newPort, proto: 'TCP', action: 'ALLOW', from: 'Anywhere', desc: 'Custom Rule' }]);
        setNewPort('');
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex space-x-2">
                <Input placeholder="Port (e.g., 443)" value={newPort} onChange={e => setNewPort(e.target.value)} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                <Button onClick={addRule}><Plus size={16} /> Add</Button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex-1">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                        <tr><th className="p-3">Port/Proto</th><th className="p-3">Action</th><th className="p-3">From</th><th className="p-3">Note</th><th className="p-3 text-right"></th></tr>
                    </thead>
                    <tbody>
                        {rules.map(r => (
                            <tr key={r.id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900/50">
                                <td className="p-3 font-mono text-slate-800 dark:text-white">{r.port}/{r.proto}</td>
                                <td className="p-3"><Badge variant={r.action === 'ALLOW' ? 'success' : 'danger'}>{r.action}</Badge></td>
                                <td className="p-3">{r.from}</td>
                                <td className="p-3 italic text-slate-500 dark:text-slate-600">{r.desc}</td>
                                <td className="p-3 text-right"><button onClick={() => setRules(rules.filter(x => x.id !== r.id))} className="text-red-500 hover:text-red-600"><Trash2 size={14}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ConfigEditor: React.FC = () => {
    const [config, setConfig] = useState({
        wgPort: '51820',
        dns: '1.1.1.1, 8.8.8.8',
        mtu: '1420',
        allowedIps: '10.100.0.0/24',
        keepAlive: '25'
    });

    const [rawMode, setRawMode] = useState(false);
    const [rawConfig, setRawConfig] = useState(`[Interface]\nAddress = 10.100.0.1/24\nListenPort = 51820\nPrivateKey = <HIDDEN>\n...`);

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Server Configuration</h4>
                <button onClick={() => setRawMode(!rawMode)} className="text-xs text-brand-600 dark:text-brand-500 hover:underline">
                    Switch to {rawMode ? 'Form View' : 'Raw Editor'}
                </button>
            </div>

            {rawMode ? (
                <textarea 
                    className="flex-1 w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-300 font-mono text-xs p-4 rounded-lg border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:outline-none resize-none"
                    value={rawConfig}
                    onChange={e => setRawConfig(e.target.value)}
                />
            ) : (
                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                    <Input 
                        label="WireGuard Port" 
                        value={config.wgPort} 
                        onChange={e => setConfig({...config, wgPort: e.target.value})} 
                        description="UDP port for the tunnel interface. Default: 51820"
                    />
                    <Input 
                        label="DNS Servers" 
                        value={config.dns} 
                        onChange={e => setConfig({...config, dns: e.target.value})} 
                        description="Comma separated list of DNS resolvers pushed to clients."
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="MTU" 
                            value={config.mtu} 
                            onChange={e => setConfig({...config, mtu: e.target.value})} 
                            description="Packet size. Lower if connection unstable."
                        />
                        <Input 
                            label="Persistent Keepalive" 
                            value={config.keepAlive} 
                            onChange={e => setConfig({...config, keepAlive: e.target.value})} 
                            description="Seconds between heartbeat packets."
                        />
                    </div>
                    <Input 
                        label="Allowed IPs (Subnet)" 
                        value={config.allowedIps} 
                        onChange={e => setConfig({...config, allowedIps: e.target.value})} 
                        description="The internal VPN subnet range."
                    />
                    
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-start space-x-3">
                        <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={16} />
                        <p className="text-xs text-amber-700 dark:text-amber-200">Changing these settings requires a service restart. Connected users will be disconnected temporarily.</p>
                    </div>
                </div>
            )}
            
            <Button className="w-full"><Save size={16} className="mr-2" /> Apply Configuration</Button>
        </div>
    );
};

export const LogsPanel: React.FC = () => {
    const [filter, setFilter] = useState('');
    const logs = [
        { time: '10:42:05', level: 'INFO', sys: 'SYSTEM', msg: 'WireGuard Service Started successfully.' },
        { time: '10:42:06', level: 'INFO', sys: 'KERNEL', msg: 'wg0: link becomes ready' },
        { time: '10:45:12', level: 'INFO', sys: 'AUTH', msg: 'Accepted publickey for peer 8923... from 192.168.1.45:49201' },
        { time: '10:46:00', level: 'DEBUG', sys: 'NET', msg: 'Sending keepalive packet to peer 8923...' },
        { time: '10:52:30', level: 'WARN', sys: 'FIREWALL', msg: 'Dropped packet from unauthorized peer 10.0.0.23 on port 22' },
        { time: '11:05:00', level: 'INFO', sys: 'AUTH', msg: 'Key rotation scheduled in 140s' },
        { time: '11:10:22', level: 'ERROR', sys: 'SYSTEM', msg: 'High CPU load detected (92%)' },
    ];

    const getLevelColor = (level: string) => {
        if (level === 'INFO') return 'text-emerald-600 dark:text-emerald-400';
        if (level === 'WARN') return 'text-amber-600 dark:text-amber-400';
        if (level === 'ERROR') return 'text-red-600 dark:text-red-400';
        return 'text-slate-500 dark:text-slate-400';
    };

    return (
        <div className="flex flex-col h-full space-y-2">
            <div className="flex space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 text-slate-500" size={14} />
                    <input 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500" 
                        placeholder="Search logs..." 
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                </div>
                <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-700"><Download size={14} /></Button>
            </div>
            <div className="space-y-1 font-mono text-[10px] leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-lg flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800">
                {logs.filter(l => l.msg.toLowerCase().includes(filter.toLowerCase()) || l.sys.toLowerCase().includes(filter.toLowerCase())).map((log, i) => (
                    <div key={i} className="flex space-x-3 border-b border-slate-200 dark:border-slate-900/50 pb-1 mb-1 last:border-0">
                        <span className="text-slate-500">{log.time}</span>
                        <span className={`font-bold w-12 ${getLevelColor(log.level)}`}>{log.level}</span>
                        <span className="text-brand-600 dark:text-brand-300 w-16">[{log.sys}]</span>
                        <span className="text-slate-700 dark:text-slate-300 flex-1">{log.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
