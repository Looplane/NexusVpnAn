import React, { useState, useEffect } from 'react';
import { MetricCard } from './AdminWidgets';
import { Cpu, HardDrive, Activity, Wifi } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { Card } from './UI';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Update uptime display in parent
const updateUptimeDisplay = (serverId: string, uptime: string) => {
    const element = document.getElementById(`uptime-${serverId}`);
    if (element) {
        element.textContent = uptime;
    }
};

interface ServerMetrics {
    cpu: { usage: number; cores: number; frequency: string };
    ram: { used: number; total: number; usage: number };
    load: { current: number; avg1: number; avg5: number; avg15: number };
    uptime: string;
    network: { inbound: number; outbound: number };
}

interface ServerDashboardProps {
    serverId: string;
}

export const ServerDashboard: React.FC<ServerDashboardProps> = ({ serverId }) => {
    const [metrics, setMetrics] = useState<ServerMetrics | null>(null);
    const [networkHistory, setNetworkHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await apiClient.getServerMetrics(serverId);
                setMetrics(data);
                
                // Update uptime in parent component
                updateUptimeDisplay(serverId, data.uptime);
                
                // Add to network history for graph
                setNetworkHistory(prev => {
                    const newData = [...prev, {
                        time: new Date().toLocaleTimeString(),
                        inbound: data.network.inbound,
                        outbound: data.network.outbound
                    }];
                    return newData.slice(-24); // Keep last 24 data points
                });
            } catch (error) {
                console.error('Failed to fetch metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, [serverId]);

    if (loading || !metrics) {
        return <div className="p-4 text-center text-slate-500">Loading metrics...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-3 gap-4">
                <MetricCard 
                    label="CPU" 
                    value={metrics.cpu.usage} 
                    unit="%" 
                    icon={Cpu} 
                    color="text-brand-500" 
                    detail={`${metrics.cpu.cores} Cores @ ${metrics.cpu.frequency}`} 
                />
                <MetricCard 
                    label="RAM" 
                    value={metrics.ram.usage} 
                    unit="%" 
                    icon={HardDrive} 
                    color="text-indigo-500" 
                    detail={`${metrics.ram.used}/${metrics.ram.total} GB Used`} 
                />
                <MetricCard 
                    label="LOAD" 
                    value={metrics.load.current} 
                    unit="%" 
                    icon={Activity} 
                    color="text-emerald-500" 
                    detail={`LA: ${metrics.load.avg1.toFixed(2)}, ${metrics.load.avg5.toFixed(2)}, ${metrics.load.avg15.toFixed(2)}`} 
                />
            </div>

            {/* Network Traffic Graph */}
            <Card className="p-4 h-72">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <Wifi size={16} className="mr-2 text-brand-500" /> Network Traffic (Real-time)
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={networkHistory.length > 0 ? networkHistory : [{ time: 'Now', inbound: 0, outbound: 0 }]}>
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
        </div>
    );
};

