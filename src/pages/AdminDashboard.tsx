import {
  Activity,
  Building2,
  Users,
  CreditCard,
  LifeBuoy,
  TrendingUp,
  AlertTriangle,
  Server
} from 'lucide-react';

function StatCard({ title, value, change, icon: Icon, trend }: any) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-slate-500 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        <Icon size={16} />
      </div>
      <div className="flex items-end gap-3">
        <span className="text-2xl font-black text-slate-900">{value}</span>
        {change && (
          <span className={`text-xs font-bold mb-1 ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {change}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Control Center</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Live overview of QueueLess platform operations.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Healthy
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Shops" value="1,248" change="+12% this month" icon={Building2} trend="up" />
        <StatCard title="Live Customers" value="8,405" change="+5% vs yesterday" icon={Users} trend="up" />
        <StatCard title="MRR" value="₹4.2M" change="+18% this quarter" icon={CreditCard} trend="up" />
        <StatCard title="Open Tickets" value="24" change="-3 vs yesterday" icon={LifeBuoy} trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Operations Chart Placeholder */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity size={16} className="text-blue-500" /> Platform Throughput (Tokens/Hr)
              </h3>
              <select className="bg-transparent text-xs font-bold text-slate-500 outline-none cursor-pointer">
                <option>Today</option>
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="p-5 h-72 flex items-center justify-center bg-slate-50/30">
              <div className="text-center">
                <TrendingUp size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">Analytics visualization goes here</p>
                <p className="text-xs text-slate-400 mt-1">Implement with Recharts or Chart.js</p>
              </div>
            </div>
          </section>

          {/* Recent Registrations Table */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="text-sm font-bold text-slate-900">Recent Shop Registrations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-bold">Shop Name</th>
                    <th className="px-5 py-3 font-bold">Category</th>
                    <th className="px-5 py-3 font-bold">Plan</th>
                    <th className="px-5 py-3 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {/* Dummy Data for Visual Structure */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-900 font-bold">Apollo Clinic</td>
                    <td className="px-5 py-3">CLINIC</td>
                    <td className="px-5 py-3"><span className="text-blue-600 font-bold">PRO</span></td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex rounded px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider text-[9px] font-bold">Active</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-900 font-bold">City Bank Main</td>
                    <td className="px-5 py-3">BANK</td>
                    <td className="px-5 py-3 text-slate-500">TRIAL</td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex rounded px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider text-[9px] font-bold">Pending Review</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-900 font-bold">Lakme Salon</td>
                    <td className="px-5 py-3">SALON</td>
                    <td className="px-5 py-3 text-slate-500">FREE</td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex rounded px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider text-[9px] font-bold">Active</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* System Health */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Server size={16} className="text-slate-400" /> Infrastructure Health
              </h3>
            </div>
            <div className="p-5 divide-y divide-slate-100">
              <div className="py-3 first:pt-0 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">WebSocket Cluster</span>
                <span className="text-xs font-black text-emerald-600">99.98% uptime</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">PostgreSQL DB</span>
                <span className="text-xs font-black text-emerald-600">12ms latency</span>
              </div>
              <div className="py-3 pb-0 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">Razorpay Sync</span>
                <span className="flex items-center gap-1 text-xs font-black text-amber-600">
                  <AlertTriangle size={12} /> 2 failed webhooks
                </span>
              </div>
            </div>
          </section>

          {/* Action Center */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
            </div>
            <div className="p-3 grid gap-2">
              <button className="text-left px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors">
                View Unassigned Tickets (12)
              </button>
              <button className="text-left px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors">
                Review Pending Shops (4)
              </button>
              <button className="text-left px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors">
                Broadcast System Alert
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
