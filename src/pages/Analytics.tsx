import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Bar, BarChart, CartesianGrid, 
  ResponsiveContainer, Tooltip, XAxis, YAxis, 
  Cell, PieChart, Pie, Area, AreaChart 
} from 'recharts';
import { useDashboard } from '../components/layout/DashboardLayout';
import { Breadcrumbs } from '../components/shared';
import { analyticsApi } from '../lib/api';
import { 
  TrendingUp, Users, Clock, 
  Loader2,
  CheckCircle2, AlertTriangle, Activity
} from 'lucide-react';

interface AnalyticsData {
  dailyTraffic: { date: string; count: number }[];
  hourlyHeatmap: { hour: number; count: number }[];
  noShowRate: number;
  servicePopularity: { service: string; count: number }[];
  providerPerformance: { name: string; total: number; served: number }[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

function StatCard({ label, value, sub, icon: Icon, color }: { 
  label: string; value: string | number; sub?: string; icon: any; color: string 
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        {sub && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            {sub}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      {payload.map((item: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          <p className="text-sm font-semibold text-slate-700">
            {item.name}: <span className="text-slate-900 font-bold">{item.value}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { activeShop } = useDashboard();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!activeShop) return;
    setLoading(true);
    analyticsApi.getShopAnalytics(activeShop.id, days)
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [activeShop, days]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-slate-500 font-medium animate-pulse">Crunching your numbers...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const trafficData = data.dailyTraffic.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    Tokens: item.count
  }));

  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const found = data.hourlyHeatmap.find(h => h.hour === i);
    return {
      hour: `${String(i).padStart(2, '0')}:00`,
      Tokens: found ? found.count : 0
    };
  }).filter(h => h.Tokens > 0 || (parseInt(h.hour) >= 8 && parseInt(h.hour) <= 22));

  const totalTokens = data.dailyTraffic.reduce((acc, curr) => acc + curr.count, 0);
  const totalServed = data.providerPerformance.reduce((acc, curr) => acc + curr.served, 0);
  const avgDaily = Math.round(totalTokens / days);

  return (
    <div className="ql-page">
      <Breadcrumbs />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="ql-kicker">Insights</p>
          <h1 className="ql-title">Performance Insights</h1>
          <p className="ql-subtitle">Data-driven overview of your branch operations.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                days === d ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {d === 90 ? 'Quarter' : `${d}D`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Total Tokens" 
          value={totalTokens.toLocaleString()} 
          sub="+12%" 
          icon={Users} 
          color="bg-indigo-500" 
        />
        <StatCard 
          label="Served Tokens" 
          value={totalServed.toLocaleString()} 
          sub={`${Math.round((totalServed/totalTokens)*100)}%`} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
        />
        <StatCard 
          label="Avg. Daily Traffic" 
          value={avgDaily} 
          icon={Activity} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="No-Show Rate" 
          value={`${Math.round(data.noShowRate * 100)}%`} 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Traffic Trend
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="Tokens" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTokens)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-pink-500" />
            Service Mix
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.servicePopularity}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="service"
                >
                  {data.servicePopularity.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {data.servicePopularity.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600 font-medium truncate max-w-[120px]">{item.service}</span>
                </div>
                <span className="text-slate-900 font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Hourly Heatmap (Peak Times)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="Tokens" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-500" />
            Staff Performance
          </h3>
          <div className="space-y-6">
            {data.providerPerformance.map((staff, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">{staff.name}</span>
                  <span className="text-xs font-medium text-slate-500">{staff.served} / {staff.total} tokens</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${(staff.served / staff.total) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
            {data.providerPerformance.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Users className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">No staff data recorded for this period.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
