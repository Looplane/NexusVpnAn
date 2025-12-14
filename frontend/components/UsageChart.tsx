
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const UsageChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-center text-slate-500 py-10">No usage data available</div>;

  // Process data for Recharts
  const processedData = data.slice(0, 14).reverse().map(d => ({
    name: new Date(d.recordDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    download: parseInt(d.bytesDownloaded) / (1024 * 1024), // MB
    upload: parseInt(d.bytesUploaded) / (1024 * 1024), // MB
  }));

  const formatBytes = (mb: number) => {
    if (mb > 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(0)} MB`;
  };

  return (
    <div className="w-full h-64 pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={processedData}>
          <defs>
            <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.1} vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tick={{fontSize: 10}} tickFormatter={(val) => `${val} MB`} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }}
            itemStyle={{ fontSize: '12px' }}
            labelStyle={{ color: '#64748b', marginBottom: '4px' }}
            formatter={(value: number) => [formatBytes(value), '']}
          />
          <Area type="monotone" dataKey="download" name="Download" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorDownload)" />
          <Area type="monotone" dataKey="upload" name="Upload" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUpload)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
