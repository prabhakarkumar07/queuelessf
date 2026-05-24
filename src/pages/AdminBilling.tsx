import {
  CreditCard,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  DollarSign,
  Activity
} from 'lucide-react';
import { useState } from 'react';

const DUMMY_SUBSCRIPTIONS = [
  { id: 'SUB-9821', shop: 'Apollo Clinic', plan: 'PRO', status: 'ACTIVE', amount: '₹1499', nextBill: 'Oct 24, 2026', gatewayId: 'sub_xyz123' },
  { id: 'SUB-9820', shop: 'City Dental', plan: 'STARTER', status: 'PAST_DUE', amount: '₹499', nextBill: 'Oct 12, 2026', gatewayId: 'sub_abc456' },
  { id: 'SUB-9819', shop: 'Lakme Salon', plan: 'GROWTH', status: 'ACTIVE', amount: '₹999', nextBill: 'Nov 1, 2026', gatewayId: 'sub_def789' },
  { id: 'SUB-9818', shop: 'Dr. Shah Clinic', plan: 'PRO', status: 'CANCELLED', amount: '₹1499', nextBill: '-', gatewayId: 'sub_ghi012' },
];

export default function AdminBilling() {
  const [search, setSearch] = useState('');

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Billing Operations</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage shop subscriptions, overrides, and gateway sync.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Filter size={14} /> Filter
          </button>
          <button className="flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
            <Activity size={14} /> Sync Razorpay
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">MRR</span>
            <DollarSign size={16} />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-black text-slate-900">₹4.2M</span>
            <span className="text-xs font-bold mb-1 text-emerald-600">↑ 12%</span>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Active Subs</span>
            <CreditCard size={16} />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-black text-slate-900">3,102</span>
            <span className="text-xs font-bold mb-1 text-emerald-600">↑ 45 new</span>
          </div>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-red-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Past Due</span>
            <AlertTriangle size={16} />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-black text-red-700">142</span>
            <span className="text-xs font-bold mb-1 text-red-600">Requires action</span>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Churn Rate</span>
            <TrendingUp size={16} className="text-red-400 rotate-180" />
          </div>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-black text-slate-900">2.4%</span>
            <span className="text-xs font-bold mb-1 text-emerald-600">↓ 0.3%</span>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="border-b border-slate-100 bg-slate-50/50 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by Shop, Sub ID, or Gateway ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Subscription ID</th>
                <th className="px-6 py-4 font-bold">Shop</th>
                <th className="px-6 py-4 font-bold">Plan</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Next Bill Date</th>
                <th className="px-6 py-4 font-bold">Gateway ID</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {DUMMY_SUBSCRIPTIONS.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{sub.id}</td>
                  <td className="px-6 py-4 font-medium">{sub.shop}</td>
                  <td className="px-6 py-4">
                    <span className="font-black text-slate-900">{sub.plan}</span>
                  </td>
                  <td className="px-6 py-4">{sub.amount}/mo</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      sub.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      sub.status === 'PAST_DUE' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {sub.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium">{sub.nextBill}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{sub.gatewayId}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors" title="View Invoices">
                        <FileText size={16} />
                      </button>
                      <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                        Override <ArrowRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 p-4 flex items-center justify-between text-sm text-slate-500">
          <span>Showing 1 to 4 of 3,102 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
