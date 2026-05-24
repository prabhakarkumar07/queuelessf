import { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Paperclip,
  Send,
  User,
  Building2,
  CreditCard,
  Lock
} from 'lucide-react';

const DUMMY_TICKETS = [
  { id: 'TKT-1042', subject: 'Payment deducted but plan not active', customer: 'Rahul Sharma', shop: 'Apollo Clinic', priority: 'URGENT', status: 'OPEN', time: '10m ago' },
  { id: 'TKT-1041', subject: 'How to add a new staff member?', customer: 'Dr. Smith', shop: 'City Dental', priority: 'NORMAL', status: 'PENDING', time: '1h ago' },
  { id: 'TKT-1040', subject: 'Queue is stuck, customers cannot join', customer: 'Manager', shop: 'Lakme Salon', priority: 'HIGH', status: 'OPEN', time: '2h ago' },
  { id: 'TKT-1039', subject: 'Change billing email', customer: 'John Doe', shop: 'XYZ Bank', priority: 'LOW', status: 'RESOLVED', time: '1d ago' },
];

export default function AdminSupport() {
  const [activeTicket, setActiveTicket] = useState(DUMMY_TICKETS[0]);
  const [replyMode, setReplyMode] = useState<'public' | 'internal'>('public');

  return (
    <div className="flex h-[calc(100vh-6.5rem)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm max-w-[1600px] mx-auto">
      
      {/* Left Pane: Ticket List */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 flex-shrink-0">
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">Support Queue</h2>
            <button className="text-slate-400 hover:text-slate-600"><Filter size={16} /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search tickets..."
              className="w-full rounded border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            <button className="whitespace-nowrap rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700">All Open (12)</button>
            <button className="whitespace-nowrap rounded-full bg-white border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50">Mine (3)</button>
            <button className="whitespace-nowrap rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-[10px] font-bold text-red-700">Urgent (2)</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-slate-100">
            {DUMMY_TICKETS.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => setActiveTicket(ticket)}
                className={`p-3 cursor-pointer transition-colors border-l-2 ${activeTicket.id === ticket.id ? 'bg-blue-50/50 border-l-blue-600' : 'hover:bg-slate-50 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-slate-500">{ticket.id}</span>
                  <span className="text-[10px] font-medium text-slate-400">{ticket.time}</span>
                </div>
                <p className="text-xs font-bold text-slate-900 mb-1 leading-tight">{ticket.subject}</p>
                <div className="flex justify-between items-end mt-2">
                  <p className="text-[10px] font-medium text-slate-500 truncate pr-2">{ticket.customer} • {ticket.shop}</p>
                  <span className={`flex-shrink-0 inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    ticket.priority === 'URGENT' ? 'bg-red-50 text-red-700 border border-red-200' : 
                    ticket.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {ticket.status === 'RESOLVED' ? 'RESOLVED' : ticket.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Pane: Active Conversation */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Ticket Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activeTicket.id}</span>
              <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                <AlertCircle size={10} /> {activeTicket.status}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 truncate">{activeTicket.subject}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <button className="rounded px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
              Assign to me
            </button>
            <button className="flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors">
              <CheckCircle2 size={14} /> Resolve
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30">
          
          {/* Customer Message */}
          <div className="flex gap-4">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-600">
              RS
            </div>
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-900">{activeTicket.customer}</span>
                <span className="text-[10px] font-medium text-slate-500">Oct 24, 10:42 AM</span>
              </div>
              <div className="rounded-lg rounded-tl-none border border-slate-200 bg-white p-3 text-[13px] text-slate-700 shadow-sm">
                <p>Hi team, I just paid for the Pro plan via Razorpay. The money was deducted from my account but the dashboard still shows I'm on the Free plan.</p>
                <p className="mt-2">Please fix this ASAP as I have a line of customers waiting and I need the SMS features!</p>
              </div>
            </div>
          </div>

          {/* Internal Note */}
          <div className="flex gap-4">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-700 border border-amber-200">
              <Lock size={12} />
            </div>
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-amber-900">System</span>
                <span className="text-[10px] font-medium text-amber-700/60">Oct 24, 10:43 AM</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Internal Note</span>
              </div>
              <div className="rounded-lg rounded-tl-none border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-900 shadow-sm">
                <p>Checked Stripe/Razorpay logs. Webhook failed with 500 error. Payment intent <code className="bg-amber-100 px-1 rounded text-xs">pay_MoXbYk2H</code> succeeded.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Composer */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-4 mb-2">
            <button 
              onClick={() => setReplyMode('public')}
              className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${replyMode === 'public' ? 'text-slate-900 bg-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Public Reply
            </button>
            <button 
              onClick={() => setReplyMode('internal')}
              className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors flex items-center gap-1 ${replyMode === 'internal' ? 'text-amber-800 bg-amber-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Lock size={12} /> Internal Note
            </button>
          </div>
          <div className={`relative rounded-lg border ${replyMode === 'internal' ? 'border-amber-300 bg-amber-50 focus-within:ring-amber-500' : 'border-slate-300 bg-white focus-within:ring-blue-500'} focus-within:ring-1 transition-shadow`}>
            <textarea
              className={`w-full min-h-[100px] max-h-[300px] rounded-lg bg-transparent p-3 text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none resize-none ${replyMode === 'internal' ? 'placeholder-amber-700/50' : ''}`}
              placeholder={replyMode === 'internal' ? 'Write a private note (visible only to agents)...' : 'Write a reply to the customer...'}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <button className={`p-1.5 rounded transition-colors ${replyMode === 'internal' ? 'text-amber-600 hover:bg-amber-100' : 'text-slate-400 hover:bg-slate-100'}`}>
                <Paperclip size={16} />
              </button>
              <button className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${replyMode === 'internal' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                <Send size={14} /> {replyMode === 'internal' ? 'Add Note' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Context Sidebar */}
      <div className="hidden xl:flex w-72 border-l border-slate-200 flex-col bg-slate-50/50 overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Customer Context</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded bg-slate-200 flex items-center justify-center text-slate-500">
              <User size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{activeTicket.customer}</p>
              <p className="text-xs text-slate-500 truncate">rahul@example.com</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded border border-slate-200 bg-white p-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Tokens</p>
              <p className="text-sm font-black text-slate-700">42</p>
            </div>
            <div className="rounded border border-slate-200 bg-white p-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Tickets</p>
              <p className="text-sm font-black text-slate-700">3</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Shop Context</h3>
          <div className="flex items-center gap-2 mb-2 text-sm">
            <Building2 size={14} className="text-slate-400" />
            <span className="font-semibold text-slate-900 truncate">{activeTicket.shop}</span>
          </div>
          <div className="flex items-center gap-2 text-sm mb-4">
            <CreditCard size={14} className="text-slate-400" />
            <span className="inline-flex rounded px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider text-[9px] font-bold">PRO PLAN</span>
          </div>
          <button className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm hover:bg-slate-50 transition-colors">
            View Shop Details
          </button>
        </div>
      </div>

    </div>
  );
}
