
import React, { useState, useEffect } from 'react';
import { Activity, ArrowDown, ArrowUp, Zap, Signal, Wifi, RefreshCw, Server, HelpCircle } from 'lucide-react';
import { Button, Tooltip } from './UI';

export const SpeedTest: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'ping' | 'download' | 'upload' | 'complete'>('idle');
  const [download, setDownload] = useState(0);
  const [upload, setUpload] = useState(0);
  const [ping, setPing] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [loss, setLoss] = useState(0);

  const runTest = () => {
    setStatus('ping');
    setDownload(0);
    setUpload(0);
    setPing(0);
    setJitter(0);
    setLoss(0);

    // 1. Simulate Ping/Jitter Phase
    let t = 0;
    const pingInterval = setInterval(() => {
        t++;
        setPing(Math.floor(Math.random() * 20) + 10);
        setJitter(Math.floor(Math.random() * 5));
        if (t > 15) {
            clearInterval(pingInterval);
            setStatus('download');
            startDownload();
        }
    }, 50);
  };

  const startDownload = () => {
      let t = 0;
      const dlInterval = setInterval(() => {
          t++;
          const val = Math.min(950, Math.floor(Math.random() * 100) + (t * 20));
          setDownload(val);
          if (t > 40) {
              clearInterval(dlInterval);
              setStatus('upload');
              startUpload();
          }
      }, 50);
  };

  const startUpload = () => {
      let t = 0;
      const ulInterval = setInterval(() => {
          t++;
          const val = Math.min(800, Math.floor(Math.random() * 100) + (t * 15));
          setUpload(val);
          if (t > 40) {
              clearInterval(ulInterval);
              setStatus('complete');
              // Finalize values
              setPing(24);
              setJitter(3);
              setLoss(0);
              setDownload(842);
              setUpload(615);
          }
      }, 50);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
              <Zap className="mr-2 text-amber-500 fill-amber-500" size={18} /> Network Performance
          </h3>
          {status !== 'idle' && status !== 'complete' && (
              <span className="flex items-center text-[10px] font-bold text-brand-500 uppercase tracking-wider animate-pulse">
                  <span className="w-2 h-2 bg-brand-500 rounded-full mr-2"></span> Testing {status}...
              </span>
          )}
      </div>

      <div className="p-5 space-y-5">
          {/* Main Speed Display */}
          <div className="grid grid-cols-2 gap-4">
              {/* Download */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${status === 'download' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                          <ArrowDown size={14} className="mr-1" /> Download
                      </span>
                      {status === 'download' && <Activity size={14} className="text-emerald-500 animate-spin" />}
                  </div>
                  <div className="flex items-baseline">
                      <span className={`text-3xl font-black tracking-tighter ${status === 'idle' ? 'text-slate-300' : 'text-emerald-500'}`}>
                          {download}
                      </span>
                      <span className="ml-1 text-xs font-bold text-slate-400">Mbps</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all duration-100" style={{ width: `${(download / 1000) * 100}%` }}></div>
                  </div>
              </div>

              {/* Upload */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${status === 'upload' ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-500 ring-1 ring-indigo-500' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                          <ArrowUp size={14} className="mr-1" /> Upload
                      </span>
                      {status === 'upload' && <Activity size={14} className="text-indigo-500 animate-spin" />}
                  </div>
                  <div className="flex items-baseline">
                      <span className={`text-3xl font-black tracking-tighter ${status === 'idle' ? 'text-slate-300' : 'text-indigo-500'}`}>
                          {upload}
                      </span>
                      <span className="ml-1 text-xs font-bold text-slate-400">Mbps</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-indigo-500 h-full transition-all duration-100" style={{ width: `${(upload / 1000) * 100}%` }}></div>
                  </div>
              </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-3 gap-3">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Ping</div>
                  <div className={`font-mono font-bold text-lg ${status === 'idle' ? 'text-slate-300' : 'text-amber-500'}`}>{ping}<span className="text-[10px] text-slate-400 ml-0.5">ms</span></div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Jitter</div>
                  <div className={`font-mono font-bold text-lg ${status === 'idle' ? 'text-slate-300' : 'text-cyan-500'}`}>{jitter}<span className="text-[10px] text-slate-400 ml-0.5">ms</span></div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Loss</div>
                  <div className={`font-mono font-bold text-lg ${status === 'idle' ? 'text-slate-300' : 'text-rose-500'}`}>{loss}<span className="text-[10px] text-slate-400 ml-0.5">%</span></div>
              </div>
          </div>

          {/* Description / Status Text */}
          <div className="text-xs text-slate-500 text-center bg-slate-100 dark:bg-slate-800/50 p-2 rounded">
              {status === 'idle' && "Ready to analyze connection quality."}
              {status === 'ping' && "Measuring server latency..."}
              {status === 'download' && "Testing download bandwidth..."}
              {status === 'upload' && "Testing upload bandwidth..."}
              {status === 'complete' && <span className="text-emerald-500 font-bold">Test Complete. Connection is Excellent.</span>}
          </div>

          <Button 
            onClick={runTest} 
            disabled={status !== 'idle' && status !== 'complete'} 
            className="w-full"
            variant="outline"
          >
            {status === 'idle' || status === 'complete' ? 'Start Speed Test' : 'Testing...'}
          </Button>
      </div>
    </div>
  );
};
