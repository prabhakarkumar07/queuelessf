import { createContext, useContext, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { shopApi } from '../../lib/api';
import type { Shop } from '../../types';
import { CloneBranchModal } from '../dashboard/CloneBranchModal';
import { DashboardFooter } from '../shared/DashboardFooter';
import { 
  LayoutDashboard, 
  BarChart2, 
  Users, 
  Layers, 
  Megaphone, 
  Star, 
  CalendarDays, 
  Award, 
  CreditCard,
  Settings, 
  Tv, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  QrCode
} from 'lucide-react';

export interface DashboardContextValue {
  shops: Shop[];
  activeShop: Shop | null;
  setActiveShop: (shop: Shop | null) => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  shops: [],
  activeShop: null,
  setActiveShop: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

interface NavItem {
  id: string;
  to: string;
  label: string;
  icon: React.ElementType;
  ownerOnly: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', to: '/dashboard', label: 'Live Queue', icon: LayoutDashboard, ownerOnly: false },
  { id: 'analytics', to: '/dashboard/analytics', label: 'Analytics', icon: BarChart2, ownerOnly: true },
  { id: 'staff', to: '/dashboard/staff', label: 'Staff', icon: Users, ownerOnly: true },
  { id: 'services', to: '/dashboard/services', label: 'Services', icon: Layers, ownerOnly: true },
  { id: 'announcements', to: '/dashboard/announcements', label: 'Broadcasts', icon: Megaphone, ownerOnly: true },
  { id: 'appointments', to: '/dashboard/appointments', label: 'Bookings', icon: CalendarDays, ownerOnly: true },
  { id: 'reviews', to: '/dashboard/reviews', label: 'Reviews', icon: Star, ownerOnly: true },
  { id: 'holidays', to: '/dashboard/holidays', label: 'Holidays', icon: CalendarDays, ownerOnly: true },
  { id: 'loyalty', to: '/dashboard/loyalty', label: 'Loyalty', icon: Award, ownerOnly: true },
  { id: 'poster', to: '/dashboard/poster', label: 'QR Poster', icon: QrCode, ownerOnly: true },
  { id: 'business', to: '/dashboard/business', label: 'Business', icon: CreditCard, ownerOnly: true },
  { id: 'subscription', to: '/dashboard/subscription', label: 'Subscription', icon: Award, ownerOnly: true },
  { id: 'setup', to: '/dashboard/setup', label: 'Launch Setup', icon: Settings, ownerOnly: true },
];

function initials(name?: string) {
  return (
    name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'QL'
  );
}

export default function DashboardLayout() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingShops, setLoadingShops] = useState(true);
  const [shopLoadError, setShopLoadError] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);

  const isOwner = user?.role === 'SHOP_OWNER' || user?.role === 'ADMIN';

  useEffect(() => {
    let mounted = true;
    setLoadingShops(true);
    setShopLoadError(false);

    shopApi
      .getAccessibleShops()
      .then(({ data }) => {
        if (mounted) {
          setShops(data);
          setActiveShop(data[0] ?? null);
        }
      })
      .catch(() => {
        if (mounted) setShopLoadError(true);
      })
      .finally(() => {
        if (mounted) setLoadingShops(false);
      });
      
    return () => { mounted = false; };
  }, []);

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  const activeId =
    [...NAV_ITEMS]
      .sort((a, b) => b.to.length - a.to.length)
      .find((item) => location.pathname === item.to || location.pathname.startsWith(item.to + '/'))
      ?.id ?? 'dashboard';

  const isManager = activeShop?.myStaffRole === 'MANAGER';
  const visibleItems = NAV_ITEMS.filter((item) => isOwner || isManager || !item.ownerOnly);
  const tvLink = activeShop ? `/tv/${activeShop.id}` : '#';
  const queueState = activeShop?.queuePaused ? 'Queue paused' : 'Accepting customers';

  const NavLinks = ({ onNav }: { onNav?: () => void }) => (
    <>
      {visibleItems.map((item) => {
        const active = activeId === item.id;
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            to={item.to}
            onClick={onNav}
            className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors duration-150 ${
              active
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon 
              size={16} 
              strokeWidth={active ? 2.5 : 2} 
              className={active ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600 transition-colors'} 
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
      <div className="my-3 h-px bg-slate-100" />
      <a
        href={tvLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNav}
        className="group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900"
      >
        <Tv size={16} strokeWidth={2} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        <span className="truncate">Display Board</span>
      </a>
    </>
  );

  return (
    <DashboardContext.Provider value={{ shops, activeShop, setActiveShop }}>
      <div className="ql-app-bg min-h-screen text-slate-900">
        <aside className="ql-sidebar fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-slate-200 lg:flex">
          <div className="flex h-14 items-center gap-3 border-b border-slate-100 px-4">
            <img src="/logo.png" alt="QueueLess Logo" className="h-7 w-7 rounded object-cover shadow-sm" />
            <p className="truncate text-sm font-semibold tracking-tight text-slate-900">QueueLess</p>
          </div>

          <div className="border-b border-slate-100 p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Workspace
            </p>
            {loadingShops ? (
              <div className="h-9 animate-pulse rounded-md bg-slate-100" />
            ) : shops.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                No shop connected
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <select
                    value={activeShop?.id ?? ''}
                    onChange={(event) => setActiveShop(shops.find((shop) => shop.id === event.target.value) ?? null)}
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 pr-8 text-[13px] font-medium text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name} {shop.branchCode ? `(${shop.branchCode})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-2.5 pointer-events-none text-slate-400" />
                </div>
                
                {isOwner && (
                  <div className="flex gap-2">
                    <Link
                      to="/dashboard/shops/new"
                      className="flex-1 rounded-md bg-slate-50 py-1.5 text-center text-[11px] font-bold text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      + New Shop
                    </Link>
                    <button
                      onClick={() => setShowCloneModal(true)}
                      className="flex-1 rounded-md bg-blue-50 py-1.5 text-center text-[11px] font-bold text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      Clone Branch
                    </button>
                  </div>
                )}
              </div>
            )}
            {shopLoadError ? (
              <p className="mt-2 text-[11px] font-medium text-red-600">
                Could not load shops
              </p>
            ) : null}
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Menu
            </p>
            <NavLinks />
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${activeShop?.queuePaused ? 'bg-red-500' : 'bg-emerald-500'}`} />
                <span className="text-xs font-medium text-slate-700">{queueState}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Link
                to="/dashboard/profile"
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md p-1 -ml-1 transition-colors hover:bg-slate-100"
                title="View profile"
              >
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name ?? ''} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-700">
                      {initials(user?.name)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-slate-900">{user?.name}</p>
                  <p className="truncate text-[11px] text-slate-500">
                    {user?.role?.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              </Link>
              <button
                onClick={logout}
                aria-label="Log out"
                className="flex shrink-0 items-center justify-center rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-95"
              >
                <LogOut size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </aside>

        <div className="lg:pl-[240px]">
          <header className="ql-topbar sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 px-4 backdrop-blur-md sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                className="flex items-center justify-center rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-slate-900">
                  {activeShop?.name ?? 'QueueLess Dashboard'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={tvLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:flex"
              >
                <Tv size={14} />
                <span>Open Display</span>
              </a>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  activeShop?.queuePaused
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${activeShop?.queuePaused ? 'bg-red-500' : 'bg-emerald-500'}`} />
                {activeShop?.queuePaused ? 'Paused' : 'Live'}
              </span>
            </div>
          </header>

          {sidebarOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)}>
              <div
                className="ql-sidebar absolute inset-y-0 left-0 flex w-[260px] flex-col shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="QueueLess Logo" className="h-7 w-7 rounded object-cover shadow-sm" />
                    <span className="text-sm font-semibold text-slate-900">QueueLess</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <X size={20} />
                  </button>
                </div>
                <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Menu</p>
                  <NavLinks onNav={() => setSidebarOpen(false)} />
                </nav>
                <div className="border-t border-slate-100 p-4">
                  <button
                    onClick={logout}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700 transition-colors hover:bg-red-100 hover:border-red-300"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="min-h-[calc(100vh-3.5rem)] flex flex-col">
            {loadingShops ? (
              <div className="ql-page">
                <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
                  <div className="space-y-4">
                    <div className="h-28 animate-pulse rounded-md border border-slate-200 bg-white" />
                    <div className="h-72 animate-pulse rounded-md border border-slate-200 bg-white" />
                  </div>
                  <div className="h-80 animate-pulse rounded-md border border-slate-200 bg-white" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1" style={{ animation: 'ql-enter 150ms ease-out both' }}>
                  <Outlet />
                </div>
                <DashboardFooter />
              </>
            )}
          </main>
        </div>
      </div>

      {showCloneModal && activeShop && (
        <CloneBranchModal
          sourceShopId={activeShop.id}
          sourceShopName={activeShop.name}
          onClose={() => setShowCloneModal(false)}
          onSuccess={(newShop) => {
            setShops((prev) => [...prev, newShop]);
            setActiveShop(newShop);
          }}
        />
      )}
    </DashboardContext.Provider>
  );
}
