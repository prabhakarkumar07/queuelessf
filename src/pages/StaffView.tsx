import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { providerApi, shopApi, staffPresenceApi, tokenApi, tokenApiExtended } from '../lib/api';
import { useQueueSocket } from '../hooks/useQueueSocket';
import { useAuthStore } from '../store/authStore';
import { TokenTransferModal } from '../components/dashboard/TokenTransferModal';
import { TokenReasonModal } from '../components/dashboard/TokenReasonModal';
import type { LiveQueue, QueueUpdateEvent, Service, ServiceProvider, Shop, Token, TokenPriority } from '../types';

const STATUS_STYLE: Record<string, string> = {
  WAITING: 'border-blue-200 bg-blue-50 text-blue-700',
  CALLED: 'border-amber-200 bg-amber-50 text-amber-800',
  ARRIVED: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  SERVING: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const PRIORITY_LABELS: Record<TokenPriority, string> = {
  NORMAL: 'Normal',
  SENIOR: 'Senior',
  PREGNANT: 'Pregnant',
  VIP: 'VIP',
  EMERGENCY: 'Emergency',
};

function StaffTokenRow({
  token,
  onServing,
  onArrived,
  onComplete,
  onSetPriority,
  onTransfer,
  onReasonAction,
  myProviderId,
}: {
  token: Token;
  onServing: (id: string) => void;
  onArrived: (id: string) => void;
  onComplete: (id: string) => void;
  onSetPriority: (id: string, priority: TokenPriority) => void;
  onTransfer: (token: Token) => void;
  onReasonAction: (token: Token, action: 'cancel' | 'skip') => void;
  myProviderId: string | null;
}) {
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const priorities: TokenPriority[] = ['NORMAL', 'SENIOR', 'PREGNANT', 'VIP', 'EMERGENCY'];
  const isMyToken = Boolean(myProviderId && token.providerId === myProviderId);

  return (
    <div className={`ql-row grid gap-3 px-3 py-2 sm:grid-cols-[64px_minmax(0,1fr)_80px_auto] sm:items-center ${isMyToken ? 'bg-amber-50/45' : ''}`}>
      <div className="flex h-10 w-12 items-center justify-center rounded-md border border-stone-200 bg-white text-[14px] font-black text-stone-950 shadow-sm sm:w-14">
        {token.displayNumber}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-bold text-stone-950">{token.userName || 'Walk-in customer'}</p>
          {isMyToken ? <span className="ql-chip border-amber-200 bg-amber-50 text-amber-800">My queue</span> : null}
          {token.priority !== 'NORMAL' ? <span className="ql-chip border-red-200 bg-red-50 text-red-700">{PRIORITY_LABELS[token.priority]}</span> : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-stone-500">
          {[token.userPhone, token.serviceName].filter(Boolean).join(' · ') || 'No customer details'}
        </p>
      </div>
      <span className={`ql-chip ${STATUS_STYLE[token.status] ?? ''}`}>{token.status}</span>
      <div className="flex flex-wrap justify-start gap-1.5 sm:justify-end">
        {token.status === 'CALLED' ? <button onClick={() => onArrived(token.id)} className="ql-btn-primary bg-cyan-600 px-2.5 py-1 text-[11px] hover:bg-cyan-700">Arrived</button> : null}
        {token.status === 'CALLED' || token.status === 'ARRIVED' ? <button onClick={() => onServing(token.id)} className="ql-btn-primary px-2.5 py-1 text-[11px]">Start</button> : null}
        {token.status === 'SERVING' ? <button onClick={() => onComplete(token.id)} className="ql-btn-primary px-2.5 py-1 text-[11px]">Done</button> : null}
        {token.status === 'WAITING' || token.status === 'CALLED' ? <button onClick={() => onReasonAction(token, 'skip')} className="ql-btn-secondary px-2.5 py-1 text-[11px]">Skip</button> : null}
        {token.status === 'WAITING' || token.status === 'CALLED' ? <button onClick={() => onTransfer(token)} className="ql-btn-secondary px-2.5 py-1 text-[11px]">Transfer</button> : null}
        {token.status === 'WAITING' || token.status === 'CALLED' ? <button onClick={() => onReasonAction(token, 'cancel')} className="ql-btn-danger px-2.5 py-1 text-[11px]">Cancel</button> : null}
        <div className="relative">
          <button onClick={() => setShowPriorityMenu((value) => !value)} className="ql-btn-secondary px-2 py-1 text-[11px]">Priority</button>
          {showPriorityMenu ? (
            <div className="absolute right-0 top-8 z-20 w-36 rounded-md border border-stone-200 bg-white p-1 shadow-xl">
              {priorities.map((priority) => (
                <button
                  key={priority}
                  onClick={() => {
                    onSetPriority(token.id, priority);
                    setShowPriorityMenu(false);
                  }}
                  className="block w-full rounded px-2.5 py-2 text-left text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  {PRIORITY_LABELS[priority]}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function StaffView() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  const [shop, setShop] = useState<Shop | null>(null);
  const [queue, setQueue] = useState<LiveQueue | null>(null);
  const [providerProfile, setProviderProfile] = useState<ServiceProvider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [calling, setCalling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [issuingWalkIn, setIssuingWalkIn] = useState(false);
  const [transferTarget, setTransferTarget] = useState<Token | null>(null);
  const [reasonAction, setReasonAction] = useState<{ token: Token; action: 'cancel' | 'skip' } | null>(null);
  const [walkInForm, setWalkInForm] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    providerId: '',
    notes: '',
  });

  useEffect(() => {
    shopApi
      .getAccessibleShops()
      .then(({ data }) => {
        const firstShop = data[0] ?? null;
        setShop(firstShop);
        if (firstShop) return tokenApi.getOperatorLiveQueue(firstShop.id);
      })
      .then((res) => {
        if (res) setQueue(res.data);
      })
      .catch(() => toast.error('Failed to load shop data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!shop || !user) return;
    providerApi
      .getByShop(shop.id)
      .then(({ data }) => {
        const providerList = data as ServiceProvider[];
        setProviders(providerList);
        const mine = providerList.find((provider) => provider.userId === user.id) ?? null;
        setProviderProfile(mine);
      })
      .catch(() => {});
    shopApi.getServices(shop.id).then(({ data }) => setServices(data)).catch(() => setServices([]));

    // Staff Heartbeat (MF-14)
    staffPresenceApi.heartbeat(shop.id, {}).catch(() => {});
    const heartbeatInterval = setInterval(() => {
      staffPresenceApi.heartbeat(shop.id, {}).catch(() => {});
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [shop, user]);

  const handleQueueUpdate = useCallback(
    (event: QueueUpdateEvent) => {
      setQueue((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentTokenDisplay: event.currentToken,
          totalWaiting: event.waitingCount,
          waitingTokens: event.waitingTokens,
          lastUpdated: event.timestamp
        };
      });
    },
    []
  );

  const socket = useQueueSocket({ shopId: shop?.id ?? 'none', onUpdate: handleQueueUpdate });

  const handleCallNext = async () => {
    if (!shop || calling) return;
    setCalling(true);
    try {
      const { data } = await tokenApi.callNext(shop.id);
      toast.success(`Called ${data.displayNumber}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No more tokens';
      toast.error(msg);
    } finally {
      setCalling(false);
    }
  };

  const handleAvailabilityToggle = async () => {
    if (!shop || !providerProfile || updatingAvailability) return;
    setUpdatingAvailability(true);
    try {
      const { data } = await providerApi.updateMyAvailability(shop.id, !providerProfile.available);
      setProviderProfile(data);
      toast.success(data.available ? 'You are available' : 'You are unavailable');
    } catch {
      toast.error('Failed to update availability');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleMarkServing = async (tokenId: string) => {
    try { await tokenApi.markServing(tokenId); toast.success('Service started'); } catch { toast.error('Failed to update status'); }
  };
  const handleMarkArrived = async (tokenId: string) => {
    try { await tokenApi.markArrived(tokenId); toast.success('Customer checked in'); } catch { toast.error('Failed to mark arrived'); }
  };
  const handleComplete = async (tokenId: string) => {
    try { await tokenApi.complete(tokenId); toast.success('Token completed'); } catch { toast.error('Failed to complete token'); }
  };
  const handleSetPriority = async (tokenId: string, priority: TokenPriority) => {
    try { await tokenApiExtended.setPriority(tokenId, priority); toast.success(`Priority set to ${PRIORITY_LABELS[priority]}`); } catch { toast.error('Failed to set priority'); }
  };

  const handleWalkInSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!shop || issuingWalkIn) return;
    setIssuingWalkIn(true);
    try {
      const { data } = await tokenApi.createWalkIn({
        shopId: shop.id,
        customerName: walkInForm.customerName.trim() || undefined,
        customerPhone: walkInForm.customerPhone.trim() || undefined,
        serviceId: walkInForm.serviceId || undefined,
        providerId: walkInForm.providerId || undefined,
        notes: walkInForm.notes.trim() || undefined,
      });
      toast.success(`Issued ${data.displayNumber}`);
      setWalkInForm({ customerName: '', customerPhone: '', serviceId: '', providerId: '', notes: '' });
      tokenApi.getOperatorLiveQueue(shop.id).then(({ data }) => setQueue(data)).catch(() => {});
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Could not issue walk-in token';
      toast.error(msg);
    } finally {
      setIssuingWalkIn(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center ql-app-bg"><div className="ql-spinner" /></div>;
  }

  const serving = queue?.waitingTokens.find((token) => token.status === 'SERVING' || token.status === 'ARRIVED' || token.status === 'CALLED');

  return (
    <div className="min-h-screen ql-app-bg text-stone-950">
      <header className="sticky top-0 z-40 border-b border-stone-200 ql-topbar px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-950 text-xs font-black text-amber-300">QL</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">QueueLess staff</p>
              <p className="truncate text-xs text-stone-500">{shop?.name ?? 'No shop assigned'}</p>
            </div>
          </div>
          <button onClick={() => { clearAuth(); navigate('/login'); }} className="ql-btn-secondary py-1.5 text-xs">Sign out</button>
        </div>
      </header>

      <main className="ql-page max-w-6xl">
        {!shop ? (
          <div className="ql-empty">
            <div>
              <p className="font-bold text-stone-950">No shop assigned</p>
              <p className="mt-1">Ask the owner to assign your staff account to a branch.</p>
            </div>
          </div>
        ) : (
          <>
            <section className="ql-panel mb-3">
              <div className="grid gap-0 sm:grid-cols-[1fr_140px_140px]">
                <div className="border-b border-stone-200 p-3 sm:border-b-0 sm:border-r">
                  <p className="ql-kicker">Workspace</p>
                  <h1 className="mt-1 text-xl font-black text-stone-950">{shop.name}</h1>
                  <p className="mt-0.5 text-xs text-stone-500">{shop.address}, {shop.city}</p>
                </div>
                <div className="border-b border-stone-200 p-3 sm:border-b-0 sm:border-r">
                  <p className="ql-kicker">Waiting</p>
                  <p className="mt-1 text-2xl font-black text-stone-950">{queue?.totalWaiting ?? 0}</p>
                </div>
                <div className="p-3">
                  <p className="ql-kicker">Your status</p>
                  <span className={`ql-chip mt-2 ${providerProfile?.available ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                    {providerProfile?.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </section>

            <div className="mb-4 flex flex-wrap gap-2">
              <button onClick={handleAvailabilityToggle} disabled={updatingAvailability || !providerProfile} className="ql-btn-secondary">
                {updatingAvailability ? 'Updating...' : providerProfile?.available ? 'Go unavailable' : 'Go available'}
              </button>
              <button onClick={handleCallNext} disabled={calling || shop.queuePaused || queue?.totalWaiting === 0} className="ql-btn-primary">
                {calling ? 'Calling...' : 'Call next'}
              </button>
            </div>

            <section className="ql-panel mb-3">
              <div className="ql-panel-head py-2">
                <h2 className="text-sm font-black text-stone-950">Walk-in token</h2>
              </div>
              <form onSubmit={handleWalkInSubmit} className="grid gap-3 p-3 md:grid-cols-5">
                <div className="md:col-span-2">
                  <label className="ql-label">Customer name</label>
                  <input
                    className="ql-field"
                    value={walkInForm.customerName}
                    onChange={(event) => setWalkInForm((value) => ({ ...value, customerName: event.target.value }))}
                    placeholder="Walk-in customer"
                  />
                </div>
                <div>
                  <label className="ql-label">Phone</label>
                  <input
                    className="ql-field"
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    value={walkInForm.customerPhone}
                    onChange={(event) => setWalkInForm((value) => ({ ...value, customerPhone: event.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="ql-label">Service</label>
                  <select
                    className="ql-field"
                    value={walkInForm.serviceId}
                    onChange={(event) => setWalkInForm((value) => ({ ...value, serviceId: event.target.value }))}
                  >
                    <option value="">Any service</option>
                    {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="ql-label">Provider</label>
                  <select
                    className="ql-field"
                    value={walkInForm.providerId}
                    onChange={(event) => setWalkInForm((value) => ({ ...value, providerId: event.target.value }))}
                  >
                    <option value="">Any available</option>
                    {providers.filter((provider) => provider.active && provider.available).map((provider) => (
                      <option key={provider.id} value={provider.id}>{provider.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="ql-label">Counter note</label>
                  <input
                    className="ql-field"
                    value={walkInForm.notes}
                    onChange={(event) => setWalkInForm((value) => ({ ...value, notes: event.target.value }))}
                    placeholder="Optional reason, complaint, or visit detail"
                  />
                </div>
                <div className="flex items-end">
                  <button type="submit" disabled={issuingWalkIn || shop.queuePaused} className="ql-btn-primary w-full">
                    {issuingWalkIn ? 'Issuing...' : 'Issue token'}
                  </button>
                </div>
              </form>
            </section>

            {shop.queuePaused ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">Queue is paused by the shop owner.</div> : null}

            {serving ? (
              <section className="ql-panel mb-4 border-emerald-200 bg-emerald-50">
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="ql-kicker text-emerald-700">{serving.status === 'SERVING' ? 'Currently serving' : serving.status === 'ARRIVED' ? 'Customer arrived' : 'Called customer'}</p>
                    <p className="mt-1 text-xl font-black text-stone-950">{serving.displayNumber} · {serving.userName || 'Walk-in customer'}</p>
                    <p className="text-sm text-stone-600">{serving.serviceName || 'General queue'}</p>
                  </div>
                  <button onClick={() => handleComplete(serving.id)} className="ql-btn-primary">Complete</button>
                </div>
              </section>
            ) : null}

            <section className="ql-panel">
              <div className="ql-panel-head flex items-center justify-between py-2.5">
                <div>
                  <h2 className="text-sm font-black text-stone-950">Live queue</h2>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] text-stone-500">{queue?.lastUpdated ? `Updated ${formatDistanceToNow(new Date(queue.lastUpdated), { addSuffix: true })}` : 'Waiting for sync'}</p>
                  <span className={`ql-live-dot h-2 w-2 rounded-full ${socket.connected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                </div>
              </div>
              {!queue?.waitingTokens.length ? (
                <div className="ql-empty m-4">Queue is empty.</div>
              ) : (
                queue.waitingTokens.map((token) => (
                  <StaffTokenRow
                    key={token.id}
                    token={token}
                    onServing={handleMarkServing}
                    onArrived={handleMarkArrived}
                    onComplete={handleComplete}
                    onSetPriority={handleSetPriority}
                    onTransfer={setTransferTarget}
                    onReasonAction={(token, action) => setReasonAction({ token, action })}
                    myProviderId={providerProfile?.id ?? null}
                  />
                ))
              )}
            </section>
          </>
        )}
      </main>
      {transferTarget && shop ? (
        <TokenTransferModal
          token={transferTarget}
          shopId={shop.id}
          onClose={() => setTransferTarget(null)}
          onTransferred={() => tokenApi.getOperatorLiveQueue(shop.id).then(({ data }) => setQueue(data)).catch(() => {})}
        />
      ) : null}
      {reasonAction && shop ? (
        <TokenReasonModal
          token={reasonAction.token}
          action={reasonAction.action}
          onClose={() => setReasonAction(null)}
          onDone={() => tokenApi.getOperatorLiveQueue(shop.id).then(({ data }) => setQueue(data)).catch(() => {})}
        />
      ) : null}
    </div>
  );
}
