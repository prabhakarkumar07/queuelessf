import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/staff': 'Staff',
  '/dashboard/services': 'Services',
  '/dashboard/announcements': 'Broadcasts',
  '/dashboard/appointments': 'Bookings',
  '/dashboard/reviews': 'Reviews',
  '/dashboard/holidays': 'Holidays',
  '/dashboard/loyalty': 'Loyalty',
  '/dashboard/poster': 'QR Poster',
  '/dashboard/business': 'Business',
  '/dashboard/subscription': 'Subscription',
  '/dashboard/setup': 'Launch Setup',
  '/dashboard/profile': 'Profile',
  '/dashboard/shops/new': 'New Shop',
};

export function Breadcrumbs() {
  const location = useLocation();
  const path = location.pathname;

  // Don't show breadcrumbs on the main dashboard page
  if (path === '/dashboard') return null;

  const currentLabel = ROUTE_LABELS[path] ?? path.split('/').pop()?.replace(/-/g, ' ') ?? '';

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[13px]">
      <Link
        to="/dashboard"
        className="font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        Dashboard
      </Link>
      <ChevronRight size={12} className="text-slate-300" />
      <span className="font-medium text-slate-900 capitalize">{currentLabel}</span>
    </nav>
  );
}
