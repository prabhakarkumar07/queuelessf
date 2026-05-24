import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Shop } from '../types';

interface DashboardHeaderProps {
  activeTab?: string;
  shops?: Shop[];
  activeShopId?: string;
  onShopChange?: (id: string) => void;
  showNav?: boolean;
}

export default function DashboardHeader({
  activeTab,
  shops = [],
  activeShopId,
  onShopChange,
  showNav = true,
}: DashboardHeaderProps) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const canManageShopSettings = user?.role === 'SHOP_OWNER' || user?.role === 'ADMIN';

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  const navLinks = [
    { id: 'dashboard', to: '/dashboard', label: 'Live Queue' },
    { id: 'staff', to: '/dashboard/staff', label: 'Staff' },
    { id: 'services', to: '/dashboard/services', label: 'Services' },
    { id: 'announcements', to: '/dashboard/announcements', label: 'Announcements' },
    { id: 'holidays', to: '/dashboard/holidays', label: 'Holidays' },
    { id: 'reviews', to: '/dashboard/reviews', label: 'Reviews' },
    { id: 'analytics', to: '/dashboard/analytics', label: 'Analytics' },
    { id: 'settings', to: '/dashboard/settings', label: 'Shop Settings' },
    { id: 'loyalty', to: '/dashboard/loyalty', label: 'Loyalty' },
    { id: 'tv', to: `/tv/${activeShopId ?? ''}`, label: 'TV Display' },
  ].filter((link) => {
    if (user?.role === 'SERVICE_PROVIDER') return link.id === 'dashboard';
    return canManageShopSettings || link.id === 'tv' || link.id === 'dashboard';
  });

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-max w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-sm font-bold text-white">
              QL
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block text-white">QueueLess</span>
          </div>

          <div className="flex items-center gap-3 lg:hidden shrink-0">
            {shops.length > 1 && onShopChange && (
              <select
                value={activeShopId || ''}
                onChange={(e) => onShopChange(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-2 py-1.5 focus:outline-none max-w-[120px]"
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={logout}
              className="text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Log Out
            </button>
          </div>

          {showNav && (
            <div className="hidden lg:flex items-center gap-6 border-l border-slate-700 pl-6 ml-2">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.to}
                  className={
                    activeTab === link.id
                      ? 'text-orange-500 font-semibold border-b-2 border-orange-500 pb-1 text-sm whitespace-nowrap'
                      : 'text-slate-400 hover:text-white transition-colors text-sm whitespace-nowrap'
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {shops.length > 1 && onShopChange && (
            <select
              value={activeShopId || ''}
              onChange={(e) => onShopChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none max-w-[180px]"
            >
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={logout}
            className="text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Log Out
          </button>
        </div>
      </div>

      {showNav && (
        <div className="lg:hidden border-t border-slate-800 px-4 py-3 overflow-x-auto">
          <nav className="flex items-center gap-5 min-w-max">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                to={link.to}
                className={
                  activeTab === link.id
                    ? 'text-orange-500 font-semibold border-b-2 border-orange-500 pb-1 text-sm whitespace-nowrap'
                    : 'text-slate-400 hover:text-white transition-colors text-sm whitespace-nowrap'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
