import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Phone, Clock, Users, Zap, ChevronRight,
  Building2, AlertCircle, Loader2
} from 'lucide-react';
import { shopApi, waitlistApi } from '../lib/api';
import { IncidentAlert } from '../components/IncidentAlert';
import type { Shop, ShopStatus } from '../types';
import toast from 'react-hot-toast';

const CATEGORY_LABELS: Record<string, string> = {
  CLINIC: '🏥 Clinic',
  SALON: '✂️ Salon',
  BANK: '🏦 Bank',
  GOVERNMENT: '🏛️ Government',
  RESTAURANT: '🍽️ Restaurant',
  OTHER: '🏢 Business',
};

function StatusBadge({ status }: { status: ShopStatus | null }) {
  if (!status) return null;
  const config: Record<ShopStatus, { label: string; cls: string }> = {
    OPEN:        { label: 'Open now',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CLOSES_SOON: { label: 'Closes soon',   cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    CLOSED:      { label: 'Closed',        cls: 'bg-red-50 text-red-700 border-red-200' },
    BREAK:       { label: 'On break',      cls: 'bg-orange-50 text-orange-700 border-orange-200' },
    HOLIDAY:     { label: 'Holiday today', cls: 'bg-slate-50 text-slate-700 border-slate-200' },
  };
  const { label, cls } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'OPEN' ? 'bg-emerald-500' : 'bg-current'}`} />
      {label}
    </span>
  );
}

export default function PublicShopPage() {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopStatus, setShopStatus] = useState<ShopStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);

  const handleJoinWaitlist = async () => {
    if (!shop) return;
    setJoiningWaitlist(true);
    try {
      await waitlistApi.join({ shopId: shop.id });
      toast.success('Joined waitlist! We will notify you when the queue opens.');
    } catch (err) {
      toast.error('Failed to join waitlist. Please ensure you are logged in.');
    } finally {
      setJoiningWaitlist(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    shopApi.getBySlug(slug)
      .then(({ data }) => {
        setShop(data);
        return shopApi.getStatus(data.id);
      })
      .then(({ data }) => setShopStatus(data.status))
      .catch((err) => {
        const status = err?.response?.status;
        setError(status === 404 ? 'This shop could not be found.' : 'Something went wrong. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <AlertCircle size={40} className="text-slate-300" />
        <h1 className="text-[20px] font-bold text-slate-900">Shop not found</h1>
        <p className="text-[14px] text-slate-500">{error}</p>
        <Link to="/" className="mt-2 rounded-md bg-slate-900 px-5 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-slate-800">
          Go home
        </Link>
      </div>
    );
  }

  const isOpen = shopStatus === 'OPEN' || shopStatus === 'CLOSES_SOON';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header banner ── */}
      <div
        className="relative overflow-hidden px-6 py-10 text-white"
        style={{ background: `linear-gradient(135deg, ${shop.primaryColor ?? '#f97316'}, ${shop.primaryColor ?? '#f97316'}cc)` }}
      >
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-4">
            {/* Logo */}
            {shop.logoUrl ? (
              <img src={shop.logoUrl} alt={shop.name} className="h-16 w-16 rounded-xl border-2 border-white/30 object-contain bg-white/10 p-1 shadow-lg" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 text-2xl font-black shadow-lg">
                {shop.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-widest text-white/60">
                {CATEGORY_LABELS[shop.category] ?? shop.category}
              </p>
              <h1 className="text-[26px] font-bold leading-tight text-white">
                {shop.name}
              </h1>
              {shop.branchCode && (
                <span className="text-[12px] text-white/60">Branch: {shop.branchCode}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">
        <IncidentAlert shop={shop} />

        {/* Status + queue */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <StatusBadge status={shopStatus} />
          {shop.currentQueueSize !== undefined && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[12px] font-semibold text-blue-700">
              <Users size={12} />
              {shop.currentQueueSize} waiting
            </span>
          )}
          {shop.estimatedWaitMins !== undefined && shop.estimatedWaitMins > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] font-semibold text-slate-600">
              <Clock size={12} />
              ~{shop.estimatedWaitMins} min wait
            </span>
          )}

          {isOpen && !shop.queuePaused ? (
            <Link
              to={`/customer`}
              id="join-queue-btn"
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-[13px] font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98]"
            >
              <Zap size={14} />
              Join Queue
              <ChevronRight size={14} />
            </Link>
          ) : (
            <button
              onClick={handleJoinWaitlist}
              disabled={joiningWaitlist}
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-slate-100 px-5 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {joiningWaitlist ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
              Join Waitlist
            </button>
          )}
        </div>

        {/* Description */}
        {shop.description && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[14px] text-slate-700 leading-relaxed">{shop.description}</p>
          </div>
        )}

        {/* Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-400">Details</h2>

          <div className="flex items-start gap-3 text-[14px] text-slate-700">
            <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
            <span>{shop.address}, {shop.city}, {shop.state} – {shop.pincode}</span>
          </div>

          <div className="flex items-center gap-3 text-[14px] text-slate-700">
            <Phone size={15} className="shrink-0 text-slate-400" />
            <a href={`tel:${shop.phone}`} className="hover:text-blue-600">{shop.phone}</a>
          </div>

          <div className="flex items-center gap-3 text-[14px] text-slate-700">
            <Clock size={15} className="shrink-0 text-slate-400" />
            <span>
              {shop.openTime} – {shop.closeTime}
              {shop.closedDays && shop.closedDays.length > 0 && (
                <span className="ml-2 text-[12px] text-slate-500">
                  Closed on {shop.closedDays.map(d => d.charAt(0) + d.slice(1).toLowerCase()).join(', ')}
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[14px] text-slate-700">
            <Building2 size={15} className="shrink-0 text-slate-400" />
            <span>Avg. service time: <strong>{shop.avgServiceMins} min</strong></span>
          </div>
        </div>

        {/* Powered by */}
        <p className="text-center text-[11px] text-slate-400 pb-4">
          Powered by{' '}
          <a href="/" className="font-semibold text-slate-600 hover:text-slate-900">QueueLess</a>
        </p>
      </div>
    </div>
  );
}
