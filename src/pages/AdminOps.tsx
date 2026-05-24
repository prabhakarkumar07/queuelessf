import { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Database,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface OpsMetrics {
  status: string;
  totalUsers: number;
  totalShops: number;
  systemLoad: number;
  jvmMemoryUsedMB: number;
  jvmMemoryMaxMB: number;
  uptimeSeconds: number;
}

export default function AdminOps() {
  const [metrics, setMetrics] = useState<OpsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/internal/ops/health');
      setMetrics(response.data);
    } catch (err) {
      toast.error('Failed to fetch system metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const memoryPercent = metrics 
    ? Math.round((metrics.jvmMemoryUsedMB / metrics.jvmMemoryMaxMB) * 100) 
    : 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            Live Operations
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Real-time system health and infrastructure metrics.</p>
        </div>
        <button 
          onClick={fetchMetrics}
          className="flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* API Health */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">System Status</span>
            <Activity size={16} />
          </div>
          <div className="flex items-end gap-3">
            {metrics?.status === 'HEALTHY' ? (
              <span className="text-2xl font-black text-emerald-600 flex items-center gap-2">
                <CheckCircle2 size={24} /> OK
              </span>
            ) : (
              <span className="text-2xl font-black text-red-600 flex items-center gap-2">
                <AlertTriangle size={24} /> DEGRADED
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-400 mt-2">
            Uptime: {metrics ? formatUptime(metrics.uptimeSeconds) : '--'}
          </p>
        </div>

        {/* Database */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Total Entities</span>
            <Database size={16} />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-black text-slate-900">{metrics?.totalUsers || 0}</span>
            <span className="text-xs font-bold mb-1 text-slate-500">Users</span>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-2">
            {metrics?.totalShops || 0} Active Shops
          </p>
        </div>

        {/* JVM Memory */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">JVM Memory</span>
            <Server size={16} />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-black text-slate-900">{memoryPercent}%</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full ${memoryPercent > 85 ? 'bg-red-500' : memoryPercent > 70 ? 'bg-amber-500' : 'bg-blue-500'}`} 
              style={{ width: `${memoryPercent}%` }}
            ></div>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-2">
            {metrics?.jvmMemoryUsedMB}MB / {metrics?.jvmMemoryMaxMB}MB
          </p>
        </div>

        {/* CPU Load */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">CPU Load</span>
            <Zap size={16} />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-black text-slate-900">
              {metrics != null && metrics.systemLoad > 0 ? metrics.systemLoad.toFixed(2) : 'N/A'}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-2">
            System 1-minute load average
          </p>
        </div>
      </div>
    </div>
  );
}
