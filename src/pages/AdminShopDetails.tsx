import { useParams } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Settings,
  ShieldAlert,
  ArrowLeft,
  Phone,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminShopDetails() {
  const { id } = useParams();

  // In a real implementation, we would fetch shop details, subscription, and recent activity from the API.
  // We'll scaffold the UI for the 3-pane CRM view here.

  return (
    <div className="flex h-full flex-col gap-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/shops" className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-slate-200 font-bold text-slate-600">
              AC
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Apollo Clinic</h1>
              <p className="text-xs font-medium text-slate-500">ID: {id || '1234-5678-9012'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
            <Settings size={14} /> Reset Configuration
          </button>
          <button className="flex items-center gap-1.5 rounded bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 border border-red-200 shadow-sm hover:bg-red-100 transition-colors">
            <ShieldAlert size={14} /> Suspend Shop
          </button>
        </div>
      </div>

      {/* 3-Pane CRM View */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 flex-1 pb-6">
        
        {/* Pane 1: Meta Profile */}
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="text-sm font-bold text-slate-900">Business Profile</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Owner</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">JD</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">John Doe</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Phone size={10}/> +91 9876543210</p>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Location</p>
                <p className="text-sm font-medium text-slate-700 flex items-start gap-1.5">
                  <MapPin size={14} className="mt-0.5 text-slate-400" />
                  123 Healthcare Ave, Sector 4<br />Bangalore, Karnataka 560034
                </p>
              </div>
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Status</p>
                <div className="flex gap-2 mt-1">
                  <span className="inline-flex rounded px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider text-[10px] font-bold">Verified</span>
                  <span className="inline-flex rounded px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider text-[10px] font-bold">Category: CLINIC</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Subscription & Billing</h3>
              <span className="inline-flex rounded px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider text-[10px] font-bold">PRO PLAN</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600">Status</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1"><Activity size={12}/> Active</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600">Billing Cycle</span>
                <span className="font-bold text-slate-900">Monthly</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600">Next Invoice</span>
                <span className="font-bold text-slate-900">Oct 15, 2026</span>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-3">
                <button className="w-full py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors">
                  View in Razorpay Dashboard
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Pane 2: Live Queues & Activity */}
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden h-full flex flex-col">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity size={16} className="text-emerald-500" /> Live Queue Status
              </h3>
            </div>
            <div className="p-5 flex-1 flex items-center justify-center bg-slate-50/30">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-emerald-50">
                  <span className="text-xl font-black text-emerald-600">14</span>
                </div>
                <p className="text-sm font-bold text-slate-900">Customers Waiting</p>
                <p className="text-xs font-medium text-slate-500">Avg Wait Time: 22 mins</p>
                <div className="pt-4">
                  <button className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50">
                    View Live Monitor
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 p-0">
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                <div className="p-4 text-center">
                  <p className="text-xs font-bold uppercase text-slate-500">Total Tokens Today</p>
                  <p className="text-lg font-black text-slate-900 mt-1">142</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xs font-bold uppercase text-slate-500">No Shows</p>
                  <p className="text-lg font-black text-slate-900 mt-1">4</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Pane 3: Support History */}
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden h-full flex flex-col">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Support Tickets</h3>
              <button className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700">Open New</button>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="divide-y divide-slate-100">
                {/* Dummy Tickets */}
                <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="inline-flex rounded px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-100 uppercase tracking-wider text-[9px] font-bold">URGENT</span>
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1"><Clock size={10}/> 2h ago</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">Payment failed but amount deducted</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">Customer reported money was deducted from their account but...</p>
                </div>
                <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="inline-flex rounded px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider text-[9px] font-bold">RESOLVED</span>
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1"><Clock size={10}/> 3d ago</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">How to add a new service provider?</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">Sent them the documentation link for staff management.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
