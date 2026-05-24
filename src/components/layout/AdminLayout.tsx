import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  LifeBuoy,
  Activity,
  LogOut,
  Menu,
  X,
  Search
} from 'lucide-react';
import { useState } from 'react';

const ADMIN_NAV = [
  { id: 'overview', to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { id: 'shops', to: '/admin/shops', label: 'Shops CRM', icon: Building2 },
  { id: 'customers', to: '/admin/customers', label: 'Customers', icon: Users },
  { id: 'billing', to: '/admin/billing', label: 'Billing Ops', icon: CreditCard },
  { id: 'support', to: '/admin/support', label: 'Support Center', icon: LifeBuoy },
  { id: 'operations', to: '/admin/ops', label: 'Live Operations', icon: Activity },
];

export default function AdminLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  const activeId =
    [...ADMIN_NAV]
      .sort((a, b) => b.to.length - a.to.length)
      .find((item) => location.pathname === item.to || location.pathname.startsWith(item.to + '/'))
      ?.id ?? 'overview';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Enterprise Topbar */}
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-slate-200 bg-slate-900 px-4 text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="QueueLess Logo" className="h-6 w-6 rounded object-cover" />
            <span className="text-sm font-semibold tracking-wide">Control Center</span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-8 lg:px-16">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search Shop ID, Phone, or Ticket... (Ctrl+K)"
              className="h-8 w-full rounded bg-slate-800 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold tracking-widest text-slate-300 uppercase">
            {user?.role?.replace('_', ' ')}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded p-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3rem)]">
        {/* Enterprise Sidebar */}
        <aside className="hidden w-[220px] flex-col border-r border-slate-200 bg-slate-100 lg:flex">
          <nav className="flex-1 space-y-0.5 p-3">
            <div className="mb-4 px-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Modules</p>
            </div>
            {ADMIN_NAV.map((item) => {
              const active = activeId === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`group flex items-center gap-2.5 rounded px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-blue-200' : 'text-slate-400 group-hover:text-slate-600'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-64 bg-slate-100 shadow-xl flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 p-4">
                <span className="text-sm font-bold">Admin Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-500">
                  <X size={18} />
                </button>
              </div>
              <nav className="p-3 space-y-1 flex-1">
                {ADMIN_NAV.map((item) => (
                  <Link
                    key={item.id}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 rounded p-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-slate-50 relative">
          <div className="h-full p-4 sm:p-6" style={{ animation: 'ql-enter 150ms ease-out both' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
