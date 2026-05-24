import { useCallback, useEffect, useMemo, useState, useRef, type FormEvent } from 'react';

import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { useDashboard } from '../components/layout/DashboardLayout';
import {
  announcementApi,
  providerApi,
  shopApi,
  tokenApi,
  tokenApiExtended,
} from '../lib/api';
import { useQueueSocket } from '../hooks/useQueueSocket';
import { useAuthStore } from '../store/authStore';
import type {
  Announcement,
  LiveQueue,
  QueueUpdateEvent,
  Service,
  ServiceProvider,
  ShopStats,
  Token,
  TokenPriority,
} from '../types';
import { cx } from '../components/dashboard/TokenRow';
import { TokenRow } from '../components/dashboard/TokenRow';
import { DashboardMetrics } from '../components/dashboard/DashboardMetrics';
import { BroadcastWidget } from '../components/dashboard/BroadcastWidget';
import { SignalsWidget } from '../components/dashboard/SignalsWidget';
import { TokenTransferModal } from '../components/dashboard/TokenTransferModal';
import { TokenReasonModal } from '../components/dashboard/TokenReasonModal';
import { IncidentControl } from '../components/dashboard/IncidentControl';
import { ProductionChecklist } from '../components/dashboard/ProductionChecklist';
import { businessAccountApi } from '../lib/api';
import type { BusinessAccount } from '../types';
import { 
  Building2, 
  MapPin, 
  RefreshCw, 
  Play, 
  Pause, 
  Power, 
  BellRing, 
  Users,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  CLINIC: 'Clinic',
  SALON: 'Salon',
  BANK: 'Banking',
  GOVERNMENT: 'Govt office',
  RESTAURANT: 'Dining',
  OTHER: 'Branch',
};

function SkeletonRows() {
  return (
    <div className="divide-y divide-slate-100">
      {[0, 1, 2, 3, 4].map((item) => (
        <div key={item} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 px-4 py-3">
          <div className="h-12 w-14 animate-pulse rounded-md bg-slate-100" />
          <div className="space-y-2">
            <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
            <div className="h-2.5 w-64 max-w-full animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-md bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-[300px] items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Users size={24} strokeWidth={1.5} />
      </div>
      <p className="text-[15px] font-semibold text-slate-900">{title}</p>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-slate-500">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

function QuickWalkInPanel({ 
  shopId, 
  queuePaused, 
  services, 
  providers, 
  onIssued 
}: { 
  shopId: string; 
  queuePaused: boolean; 
  services: Service[]; 
  providers: ServiceProvider[]; 
  onIssued: () => void 
}) {
  const [issuing, setIssuing] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    providerId: '',
    notes: ''
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (issuing) return;
    setIssuing(true);
    try {
      const { data } = await tokenApi.createWalkIn({
        shopId,
        customerName: form.customerName.trim() || undefined,
        customerPhone: form.customerPhone.trim() || undefined,
        serviceId: form.serviceId || undefined,
        providerId: form.providerId || undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success(`Issued ${data.displayNumber}`);
      setForm({ customerName: '', customerPhone: '', serviceId: '', providerId: '', notes: '' });
      onIssued();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Could not issue walk-in token';
      toast.error(msg);
    } finally {
      setIssuing(false);
    }
  };

  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <h3 className="text-[13px] font-semibold text-slate-900">Walk-in Token</h3>
      </div>
      <form onSubmit={submit} className="grid gap-3 p-4">
        <input
          className="ql-field"
          value={form.customerName}
          onChange={(event) => setForm((value) => ({ ...value, customerName: event.target.value }))}
          placeholder="Customer name"
        />
        <input
          className="ql-field"
          inputMode="numeric"
          pattern="[6-9][0-9]{9}"
          value={form.customerPhone}
          onChange={(event) => setForm((value) => ({ ...value, customerPhone: event.target.value.replace(/\D/g, '').slice(0, 10) }))}
          placeholder="Phone optional"
        />
        <select className="ql-field" value={form.serviceId} onChange={(event) => setForm((value) => ({ ...value, serviceId: event.target.value }))}>
          <option value="">Any service</option>
          {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
        </select>
        <select className="ql-field" value={form.providerId} onChange={(event) => setForm((value) => ({ ...value, providerId: event.target.value }))}>
          <option value="">Any available provider</option>
          {providers.filter((provider) => provider.active && provider.available).map((provider) => (
            <option key={provider.id} value={provider.id}>{provider.name}</option>
          ))}
        </select>
        <input
          className="ql-field"
          value={form.notes}
          onChange={(event) => setForm((value) => ({ ...value, notes: event.target.value }))}
          placeholder="Counter note optional"
        />
        <button type="submit" disabled={issuing || queuePaused} className="ql-btn-primary w-full">
          {queuePaused ? 'Queue paused' : issuing ? 'Issuing...' : 'Issue walk-in'}
        </button>
      </form>
    </section>
  );
}

function TokenList({
  tokens,
  servingToken,
  onComplete,
  onSkip,
  onSnooze,
  onServing,
  onArrived,
  onSetPriority,
  onTransfer,
  onCancel,
  onReasonedSkip,
}: {
  tokens: Token[];
  servingToken: Token | null;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onSnooze: (id: string) => void;
  onServing: (id: string) => void;
  onArrived: (id: string) => void;
  onSetPriority: (id: string, priority: TokenPriority) => void;
  onTransfer: (token: Token) => void;
  onCancel: (token: Token) => void;
  onReasonedSkip: (token: Token) => void;
}) {
  return (
    <div>
      {/* Currently serving / called banner — always visible */}
      {servingToken && (
        <div className="border-b border-emerald-100 bg-emerald-50/60 px-5 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">
                {servingToken.status === 'SERVING' ? 'Currently serving' : servingToken.status === 'ARRIVED' ? 'Customer arrived' : 'Customer called'}
              </p>
              <p className="text-xl font-bold tracking-tight text-slate-900">
                {servingToken.displayNumber}{' '}
                <span className="font-medium text-slate-400 mx-1">&middot;</span>{' '}
                {servingToken.userName || 'Walk-in'}
              </p>
              <p className="mt-1 text-[13px] text-slate-600">
                {[servingToken.serviceName, servingToken.providerName].filter(Boolean).join(' · ') || 'General queue'}
              </p>
            </div>
            <button
              onClick={() => onComplete(servingToken.id)}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-emerald-700 hover:shadow active:scale-[0.98]"
            >
              <CheckCircle2 size={16} /> Complete service
            </button>
          </div>
        </div>
      )}

      {/* Standard list (no virtualization) to allow dropdowns to overflow naturally */}
      <div className="divide-y divide-slate-100">
        {tokens.map((token) => (
          <TokenRow
            key={token.id}
            token={token}
            onSkip={onSkip}
            onSnooze={onSnooze}
            onServing={onServing}
            onArrived={onArrived}
            onSetPriority={onSetPriority}
            onTransfer={onTransfer}
            onCancel={onCancel}
            onReasonedSkip={onReasonedSkip}
          />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { activeShop, setActiveShop } = useDashboard();
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [queue, setQueue] = useState<LiveQueue | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState(false);
  const [calling, setCalling] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [providerProfile, setProviderProfile] = useState<ServiceProvider | null>(null);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [business, setBusiness] = useState<BusinessAccount | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [transferTarget, setTransferTarget] = useState<Token | null>(null);
  const [reasonAction, setReasonAction] = useState<{ token: Token; action: 'cancel' | 'skip' } | null>(null);
  
  const statsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canManageShopSettings = useMemo(() => 
    user?.role === 'SHOP_OWNER' || user?.role === 'ADMIN' || activeShop?.myStaffRole === 'MANAGER',
  [user, activeShop]);

  const loadQueueData = useCallback(() => {
    if (!activeShop) return;

    setLoadingData(true);
    setDataError(false);
    Promise.all([shopApi.getStats(activeShop.id), tokenApi.getOperatorLiveQueue(activeShop.id)])
      .then(([statsRes, queueRes]) => {
        setStats(statsRes.data);
        setQueue(queueRes.data);
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
        setDataError(true);
        toast.error('Failed to load live queue');
      })
      .finally(() => setLoadingData(false));

    if (canManageShopSettings) {
      announcementApi
        .getAll(activeShop.id)
        .then(({ data }) => setAnnouncements(data))
        .catch(() => {});

      businessAccountApi.getSettings().then(({ data }) => setBusiness(data)).catch(() => {});
      shopApi.getServices(activeShop.id).then(({ data }) => setServices(data)).catch(() => {});
      providerApi.getByShop(activeShop.id).then(({ data }) => setProviders(data)).catch(() => {});
    }
  }, [activeShop, canManageShopSettings]);

  useEffect(() => {
    loadQueueData();
    return () => {
      if (statsTimeoutRef.current) clearTimeout(statsTimeoutRef.current);
    }
  }, [loadQueueData]);

  useEffect(() => {
    if (!activeShop || user?.role !== 'SERVICE_PROVIDER') {
      setProviderProfile(null);
      return;
    }

    providerApi
      .getByShop(activeShop.id)
      .then(({ data }) => {
        const mine = (data as ServiceProvider[]).find((provider) => provider.userId === user.id) ?? null;
        setProviderProfile(mine);
      })
      .catch(() => setProviderProfile(null));
  }, [activeShop, user]);

  const handleQueueUpdate = useCallback(
    (event: QueueUpdateEvent) => {
      setQueue((prev) =>
        prev
          ? {
              ...prev,
              currentTokenDisplay: event.currentToken,
              totalWaiting: event.waitingCount,
              waitingTokens: event.waitingTokens,
              lastUpdated: event.timestamp,
            }
          : prev
      );

      // Debounce stats fetching to prevent DDOS on bulk socket updates
      if (['TOKEN_CALLED', 'TOKEN_ARRIVED', 'TOKEN_SERVED', 'TOKEN_CANCELLED', 'TOKEN_SERVING'].includes(event.eventType) && activeShop) {
        if (statsTimeoutRef.current) {
          clearTimeout(statsTimeoutRef.current);
        }
        statsTimeoutRef.current = setTimeout(() => {
          shopApi.getStats(activeShop.id).then(({ data }) => setStats(data)).catch(() => {});
        }, 1500);
      }
    },
    [activeShop]
  );

  const socket = useQueueSocket({
    shopId: activeShop?.id ?? 'none',
    onUpdate: handleQueueUpdate,
  });

  const handleCallNext = async () => {
    if (!activeShop || calling) return;
    setCalling(true);
    try {
      const { data } = await tokenApi.callNext(activeShop.id);
      toast.success(`Called ${data.displayNumber}`, { icon: '🔔' });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No waiting tokens';
      toast.error(msg);
    } finally {
      setCalling(false);
    }
  };

  const handleSkip = async (tokenId: string) => {
    // Optimistic UI
    setQueue(prev => prev ? {
      ...prev,
      waitingTokens: prev.waitingTokens.filter(t => t.id !== tokenId),
      totalWaiting: Math.max(0, prev.totalWaiting - 1)
    } : null);

    try {
      await tokenApi.skip(tokenId);
      toast('Token skipped', { icon: '⏭️' });
    } catch {
      toast.error('Failed to skip token');
      loadQueueData(); // rollback
    }
  };

  const handleSnooze = async (tokenId: string) => {
    try {
      await tokenApi.snooze(tokenId);
      toast('Token snoozed (pushed back)', { icon: '⏰' });
    } catch {
      toast.error('Failed to snooze token');
    }
  };

  const handleMarkServing = async (tokenId: string) => {
    // Optimistic UI
    setQueue(prev => prev ? {
      ...prev,
      waitingTokens: prev.waitingTokens.map(t => t.id === tokenId ? { ...t, status: 'SERVING' } : t)
    } : null);

    try {
      await tokenApi.markServing(tokenId);
      toast.success('Service started');
    } catch {
      toast.error('Failed to update token');
      loadQueueData(); // rollback
    }
  };

  const handleMarkArrived = async (tokenId: string) => {
    setQueue(prev => prev ? {
      ...prev,
      waitingTokens: prev.waitingTokens.map(t => t.id === tokenId ? { ...t, status: 'ARRIVED' } : t)
    } : null);

    try {
      await tokenApi.markArrived(tokenId);
      toast.success('Customer checked in');
    } catch {
      toast.error('Failed to mark arrived');
      loadQueueData();
    }
  };

  const handleComplete = async (tokenId: string) => {
    // Optimistic UI
    setQueue(prev => prev ? {
      ...prev,
      waitingTokens: prev.waitingTokens.filter(t => t.id !== tokenId)
    } : null);

    try {
      await tokenApi.complete(tokenId);
      toast.success('Token completed');
    } catch {
      toast.error('Failed to complete token');
      loadQueueData(); // rollback
    }
  };

  const handleSetPriority = async (tokenId: string, priority: TokenPriority) => {
    // Optimistic UI
    setQueue(prev => prev ? {
      ...prev,
      waitingTokens: prev.waitingTokens.map(t => t.id === tokenId ? { ...t, priority } : t)
    } : null);

    try {
      await tokenApiExtended.setPriority(tokenId, priority);
      toast.success(`Priority updated`);
    } catch {
      toast.error('Failed to set priority');
      loadQueueData(); // rollback
    }
  };

  const handlePauseToggle = async () => {
    if (!activeShop) return;
    try {
      const action = activeShop.queuePaused ? shopApi.resumeQueue : shopApi.pauseQueue;
      const { data } = await action(activeShop.id);
      setActiveShop(data);
      toast(data.queuePaused ? 'Queue paused' : 'Queue resumed', {
        icon: data.queuePaused ? '⏸️' : '▶️'
      });
    } catch {
      toast.error('Failed to update queue');
    }
  };

  const handleClearQueue = async () => {
    if (!activeShop || clearing) return;
    if (!window.confirm("Are you sure you want to clear the entire queue? All waiting customers will be cancelled.")) return;
    
    setClearing(true);
    try {
      await tokenApi.clearQueue(activeShop.id, "Queue cleared by shop owner");
      toast.success('Queue cleared successfully');
      loadQueueData();
    } catch {
      toast.error('Failed to clear queue');
    } finally {
      setClearing(false);
    }
  };

  const handleMyAvailabilityToggle = async () => {
    if (!activeShop || !providerProfile || updatingAvailability) return;
    try {
      setUpdatingAvailability(true);
      const { data } = await providerApi.updateMyAvailability(activeShop.id, !providerProfile.available);
      setProviderProfile(data);
      toast.success(data.available ? 'You are available' : 'You are unavailable');
    } catch {
      toast.error('Failed to update availability');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const servingToken =
    queue?.waitingTokens.find((token) => token.status === 'SERVING' || token.status === 'ARRIVED' || token.status === 'CALLED') ?? null;

  const waitingTokens = queue?.waitingTokens ?? [];

  const lastUpdated = useMemo(() => {
    if (!queue?.lastUpdated) return 'Waiting for sync';
    return formatDistanceToNow(new Date(queue.lastUpdated), { addSuffix: true });
  }, [queue?.lastUpdated]);

  if (!activeShop) {
    return (
      <div className="ql-page">
        <EmptyState
          title={canManageShopSettings ? 'No branches are configured' : 'No assigned branch'}
          body={
            canManageShopSettings
              ? 'Create a shop profile before opening the live queue console.'
              : 'Ask the owner to assign this staff account to a branch.'
          }
          action={
            canManageShopSettings ? (
              <Link to="/dashboard/shops/new" className="ql-btn-primary">
                <Building2 size={16} />
                Create branch
              </Link>
            ) : null
          }
        />
      </div>
    );
  }

  return (
    <div className="ql-page">
      <section className="mb-3 rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="ql-chip">
                <Building2 size={12} />
                {CATEGORY_LABELS[activeShop.category] ?? 'Branch'}
              </span>
              <span
                className={cx(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                  activeShop.queuePaused ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                )}
              >
                <span className={cx('h-1.5 w-1.5 rounded-full', activeShop.queuePaused ? 'bg-red-500' : 'bg-emerald-500 ql-live-dot')} />
                {activeShop.queuePaused ? 'Paused' : 'Live'}
              </span>
              {dataError && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                  <AlertTriangle size={12} /> Sync issue
                </span>
              )}
            </div>
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">{activeShop.name}</h1>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-slate-500">
              <MapPin size={12} />
              {activeShop.address}, {activeShop.city} <span className="mx-1">&middot;</span> Updated {lastUpdated}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user?.role === 'SERVICE_PROVIDER' && providerProfile && (
              <button
                onClick={handleMyAvailabilityToggle}
                disabled={updatingAvailability}
                className={cx(
                  'inline-flex items-center gap-2 rounded-md border px-4 py-2 text-[13px] font-semibold shadow-sm transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
                  providerProfile.available
                    ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
                )}
              >
                <Power size={14} />
                {providerProfile.available ? 'Go unavailable' : 'Go available'}
              </button>
            )}
            {canManageShopSettings && (
              <button
                onClick={handlePauseToggle}
                className={cx(
                  'inline-flex items-center gap-2 rounded-md border px-4 py-2 text-[13px] font-semibold shadow-sm transition-all duration-150 active:scale-[0.98]',
                  activeShop.queuePaused
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                )}
              >
                {activeShop.queuePaused ? <Play size={14} /> : <Pause size={14} />}
                {activeShop.queuePaused ? 'Resume queue' : 'Pause queue'}
              </button>
            )}
            {canManageShopSettings && (
              <button
                onClick={handleClearQueue}
                disabled={clearing || queue?.totalWaiting === 0}
                className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-[13px] font-semibold text-red-700 shadow-sm transition-all duration-150 hover:bg-red-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {clearing ? <RefreshCw size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                Clear queue
              </button>
            )}
            <button
              onClick={handleCallNext}
              disabled={calling || activeShop.queuePaused || queue?.totalWaiting === 0}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {calling ? <RefreshCw size={16} className="animate-spin" /> : <BellRing size={16} />}
              {calling ? 'Calling...' : 'Call next'}
            </button>
          </div>
        </div>

        <DashboardMetrics stats={stats} queue={queue} />
      </section>

      {dataError && (
        <div className="mb-4 flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle size={16} />
            Live queue data could not be refreshed. Existing actions may be stale.
          </div>
          <button
            onClick={loadQueueData}
            className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-50 active:scale-95"
          >
            <RefreshCw size={12} /> Retry sync
          </button>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[13px] font-bold text-slate-900">Live Queue</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className={`h-2 w-2 rounded-full shadow-[0_0_0_2px_rgba(16,185,129,0.15)] ${socket.connected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
              {socket.connected ? 'Socket connected' : 'Syncing...'}
            </div>
          </div>

          <div className="hidden gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:grid sm:grid-cols-[64px_minmax(120px,1.5fr)_100px_90px_minmax(150px,auto)]">
            <span>Token</span>
            <span>Customer</span>
            <span>Wait</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {loadingData ? (
            <SkeletonRows />
          ) : waitingTokens.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="Queue is clear"
                body="New walk-ins and appointment tokens will appear here as soon as customers join."
              />
            </div>
          ) : (
            <TokenList
              tokens={waitingTokens}
              servingToken={servingToken}
              onComplete={handleComplete}
              onSkip={handleSkip}
              onSnooze={handleSnooze}
              onServing={handleMarkServing}
              onArrived={handleMarkArrived}
              onSetPriority={handleSetPriority}
              onTransfer={setTransferTarget}
              onCancel={(token) => setReasonAction({ token, action: 'cancel' })}
              onReasonedSkip={(token) => setReasonAction({ token, action: 'skip' })}
            />
          )}
        </section>

        <aside className="space-y-4">
          {canManageShopSettings && activeShop && (
            <ProductionChecklist 
              shop={activeShop} 
              business={business}
              servicesCount={services.length}
              staffCount={providers.length}
            />
          )}
          {canManageShopSettings ? (
            <QuickWalkInPanel 
              shopId={activeShop.id} 
              queuePaused={activeShop.queuePaused} 
              services={services}
              providers={providers}
              onIssued={loadQueueData} 
            />
          ) : null}

          <section className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
              <h3 className="text-[13px] font-semibold text-slate-900">Operational Health</h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50">
                <span className="text-[13px] font-medium text-slate-600">Queue capacity</span>
                <span className="text-[13px] font-semibold text-slate-900">
                  {activeShop.currentQueueSize ?? queue?.totalWaiting ?? 0} / {activeShop.maxQueueSize}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50">
                <span className="text-[13px] font-medium text-slate-600">Service time</span>
                <span className="text-[13px] font-semibold text-slate-900">{activeShop.avgServiceMins} min avg</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50">
                <span className="text-[13px] font-medium text-slate-600">No-show grace</span>
                <span className="text-[13px] font-semibold text-slate-900">{activeShop.noShowGraceMins ?? 5} min</span>
              </div>
            </div>
          </section>

          {canManageShopSettings && (
            <>
              <IncidentControl 
                shop={activeShop} 
                onUpdate={(updated) => setActiveShop(updated)} 
              />
              <BroadcastWidget 
                shopId={activeShop.id} 
                announcements={announcements} 
                setAnnouncements={setAnnouncements} 
              />
              <SignalsWidget shopId={activeShop.id} />
            </>
          )}
        </aside>
      </div>

      {transferTarget && activeShop ? (
        <TokenTransferModal
          token={transferTarget}
          shopId={activeShop.id}
          onClose={() => setTransferTarget(null)}
          onTransferred={loadQueueData}
        />
      ) : null}
      {reasonAction ? (
        <TokenReasonModal
          token={reasonAction.token}
          action={reasonAction.action}
          onClose={() => setReasonAction(null)}
          onDone={loadQueueData}
        />
      ) : null}
    </div>
  );
}
