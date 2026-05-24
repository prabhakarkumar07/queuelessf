import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Award,
  Bell,
  CalendarDays,
  Compass,
  History,
  LogOut,
  MapPin,
  Search,
  Star,
  Ticket,
  User,
  Wifi,
} from 'lucide-react';
import {
  appointmentApi,
  loyaltyApi,
  providerApi,
  reviewApi,
  shopApi,
  tokenApi,
  waitlistApi,
} from '../lib/api';
import { IncidentAlert } from '../components/IncidentAlert';
import { DashboardFooter } from '../components/shared/DashboardFooter';
import { useQueueSocket } from '../hooks/useQueueSocket';
import { useAuthStore } from '../store/authStore';
import type { Appointment, LiveQueue, LoyaltyData, QueueUpdateEvent, Service, ServiceProvider, Shop, Token } from '../types';

const ACTIVE_TOKEN_STATUSES = ['WAITING', 'CALLED', 'ARRIVED', 'SERVING', 'SKIPPED'];
const SHOP_CATEGORIES = ['ALL', 'CLINIC', 'SALON', 'BANK', 'GOVERNMENT', 'RESTAURANT', 'OTHER'];

type PortalTab = 'dashboard' | 'discover' | 'history' | 'rewards' | 'profile';

interface ShopDetails {
  shop: Shop;
  services: Service[];
  providers: ServiceProvider[];
  queue: LiveQueue | null;
}

function isActiveToken(token: Token) {
  return ACTIVE_TOKEN_STATUSES.includes(token.status);
}

function errorMessage(err: unknown, fallback: string) {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

function toDateTimeLocal(value: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function buildSlots(shop: Shop, service: Service | null) {
  if (!service) return [];
  const slots: string[] = [];
  const [openHour, openMinute] = shop.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = shop.closeTime.split(':').map(Number);
  const step = Math.max(service.durationMins, 30);
  const now = new Date();

  for (let dayOffset = 0; dayOffset < 3 && slots.length < 12; dayOffset += 1) {
    const day = new Date();
    day.setDate(day.getDate() + dayOffset);
    const start = new Date(day);
    start.setHours(openHour || 0, openMinute || 0, 0, 0);
    const end = new Date(day);
    end.setHours(closeHour || 0, closeMinute || 0, 0, 0);
    let cursor = start;
    if (dayOffset === 0 && cursor < now) {
      cursor = new Date(now.getTime() + 20 * 60 * 1000);
      cursor.setSeconds(0, 0);
    }
    while (cursor < end && slots.length < 12) {
      if (new Date(cursor.getTime() + service.durationMins * 60 * 1000) <= end) slots.push(cursor.toISOString());
      cursor = new Date(cursor.getTime() + step * 60 * 1000);
    }
  }

  return slots;
}

function activeProgress(token: Token, queue: LiveQueue | null) {
  const position =
    queue?.waitingTokens.findIndex((item) => item.id === token.id || item.displayNumber === token.displayNumber) ??
    -1;
  const queuePosition = position >= 0 ? position + 1 : token.queuePosition;
  const ahead = queuePosition != null ? Math.max(0, queuePosition - 1) : token.tokensAhead;
  const total = Math.max(queue?.totalWaiting ?? queuePosition ?? 1, 1);
  const progress = queuePosition != null ? Math.max(8, Math.min(100, ((total - queuePosition + 1) / total) * 100)) : 18;
  return { ahead: ahead ?? 0, queuePosition, progress };
}

function ActiveTokenCard({ token, onRefresh, onOpen }: { token: Token; onRefresh: () => void; onOpen: (shopId: string) => void }) {
  const [queue, setQueue] = useState<LiveQueue | null>(null);
  const [busy, setBusy] = useState(false);
  const socket = useQueueSocket({
    shopId: token.shopId,
    onUpdate: (event: QueueUpdateEvent) => {
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
      onRefresh();
    },
  });

  useEffect(() => {
    let mounted = true;
    tokenApi.getLiveQueue(token.shopId).then(({ data }) => mounted && setQueue(data)).catch(() => {});
    return () => {
      mounted = false;
    };
  }, [token.shopId]);

  const { ahead, queuePosition, progress } = activeProgress(token, queue);

  const cancelToken = async () => {
    if (!window.confirm(`Leave the queue at ${token.shopName}?`)) return;
    setBusy(true);
    try {
      await tokenApi.cancel(token.id);
      toast.success('Token cancelled');
      onRefresh();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not cancel token'));
    } finally {
      setBusy(false);
    }
  };

  const snoozeToken = async () => {
    setBusy(true);
    try {
      await tokenApi.snooze(token.id);
      toast.success('Token snoozed');
      onRefresh();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not snooze token'));
    } finally {
      setBusy(false);
    }
  };

  const rejoinToken = async () => {
    setBusy(true);
    try {
      await tokenApi.rejoin(token.id);
      toast.success('Successfully rejoined the queue');
      onRefresh();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not rejoin queue. Rejoin limit or window exceeded.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ql-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ql-kicker">Active token</p>
          <button className="mt-1 text-left text-sm font-semibold text-slate-900 hover:underline" onClick={() => onOpen(token.shopId)}>
            {token.shopName}
          </button>
        </div>
        <span className={`ql-chip ${socket.connected ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
          <Wifi size={12} />
          {socket.connected ? 'Live' : 'Syncing'}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[130px_1fr]">
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-center">
          <p className="text-4xl font-black text-slate-950">{token.displayNumber}</p>
          <p className="mt-1 text-xs font-bold uppercase text-slate-500">{token.status}</p>
        </div>
        <div className="min-w-0">
          <div className="grid grid-cols-3 overflow-hidden rounded-md border border-slate-200">
            <MiniStat label="Position" value={queuePosition ?? '-'} />
            <MiniStat label="Ahead" value={ahead} />
            <MiniStat label="Wait" value={token.estimatedWaitMins != null ? `${token.estimatedWaitMins}m` : '-'} />
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {token.status === 'SKIPPED' ? (
              <button className="ql-btn-primary" onClick={rejoinToken} disabled={busy}>
                Rejoin Queue
              </button>
            ) : null}
            {token.status === 'WAITING' ? (
              <button className="ql-btn-secondary" onClick={snoozeToken} disabled={busy}>
                Snooze
              </button>
            ) : null}
            <button className="ql-btn-danger" onClick={cancelToken} disabled={busy}>
              Cancel token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-r border-slate-200 px-3 py-2 text-center last:border-r-0">
      <p className="text-lg font-black text-slate-950">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function ShopSheet({
  details,
  activeToken,
  onClose,
  onChanged,
}: {
  details: ShopDetails;
  activeToken?: Token;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [selectedService, setSelectedService] = useState<Service | null>(details.services[0] ?? null);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [queue, setQueue] = useState(details.queue);
  const [joining, setJoining] = useState(false);
  const [booking, setBooking] = useState(false);
  const [payingAppointment, setPayingAppointment] = useState<Appointment | null>(null);

  useQueueSocket({
    shopId: details.shop.id,
    onUpdate: (event) =>
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
      ),
  });

  const slots = useMemo(() => buildSlots(details.shop, selectedService), [details.shop, selectedService]);
  const matchingProviders = selectedService
    ? details.providers.filter((provider) => !provider.serviceIds?.length || provider.serviceIds.includes(selectedService.id))
    : details.providers;

  useEffect(() => {
    setSelectedSlot(slots[0] ?? '');
  }, [slots]);

  const joinQueue = async () => {
    setJoining(true);
    try {
      await tokenApi.getToken({
        shopId: details.shop.id,
        serviceId: selectedService?.id,
        providerId: selectedProvider?.id,
      });
      toast.success('Token issued');
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not issue token'));
    } finally {
      setJoining(false);
    }
  };

  const bookAppointment = async () => {
    if (!selectedService || !selectedSlot) {
      toast.error('Choose a service and time');
      return;
    }
    setBooking(true);
    try {
      const { data } = (await appointmentApi.book({
        shopId: details.shop.id,
        serviceId: selectedService.id,
        providerId: selectedProvider?.id,
        scheduledAt: selectedSlot,
      })) as { data: Appointment };
      if (data.amount > 0 && data.paymentStatus === 'PENDING') {
        setPayingAppointment(data);
      } else {
        toast.success('Appointment booked');
        onChanged();
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Could not book appointment'));
    } finally {
      setBooking(false);
    }
  };

  const verifyPayment = async () => {
    if (!payingAppointment?.razorpayOrderId) return;
    setBooking(true);
    try {
      await appointmentApi.verifyPayment(payingAppointment.id, {
        razorpayPaymentId: `pay_web_${Math.random().toString(36).slice(2, 9)}`,
        razorpayOrderId: payingAppointment.razorpayOrderId,
        razorpaySignature: 'simulated_sig_for_dev_mode',
      });
      toast.success('Payment verified');
      setPayingAppointment(null);
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err, 'Payment verification failed'));
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 px-4 py-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-md border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="ql-kicker">{details.shop.category}</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{details.shop.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{details.shop.address}, {details.shop.city}</p>
            </div>
            <button className="ql-btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <IncidentAlert shop={details.shop} />
            <section className="ql-panel p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-900">Live queue</p>
                <span className="ql-chip"><Bell size={12} /> WebSocket updates</span>
              </div>
              <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-md border border-slate-200">
                <MiniStat label="Now" value={queue?.currentTokenDisplay ?? '-'} />
                <MiniStat label="Waiting" value={queue?.totalWaiting ?? 0} />
                <MiniStat label="Served" value={queue?.totalServedToday ?? 0} />
              </div>
              {queue?.waitingTokens.length ? (
                <div className="mt-4 space-y-2">
                  {queue.waitingTokens.slice(0, 8).map((token, index) => (
                    <div key={token.id} className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm ${token.id === activeToken?.id ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                      <span className="w-6 text-center text-xs font-black text-slate-400">{index + 1}</span>
                      <span className="w-16 font-black text-slate-950">{token.displayNumber}</span>
                      <span className="flex-1 text-slate-500">{token.status}</span>
                      <span className="text-xs font-bold text-slate-500">{token.estimatedWaitMins ?? 0}m</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section>
              <h3 className="mb-3 text-sm font-black text-slate-900">Services</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {details.services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`rounded-md border p-3 text-left transition ${selectedService?.id === service.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  >
                    <p className="text-sm font-black text-slate-950">{service.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{service.durationMins} min · {service.price ? `Rs ${service.price}` : 'Free'}</p>
                  </button>
                ))}
              </div>
            </section>

            {matchingProviders.length ? (
              <section>
                <h3 className="mb-3 text-sm font-black text-slate-900">Staff</h3>
                <div className="flex flex-wrap gap-2">
                  <button className={`ql-chip ${!selectedProvider ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}`} onClick={() => setSelectedProvider(null)}>Any available</button>
                  {matchingProviders.map((provider) => (
                    <button key={provider.id} className={`ql-chip ${selectedProvider?.id === provider.id ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}`} onClick={() => setSelectedProvider(provider)}>
                      {provider.name}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="ql-panel p-4">
              <p className="text-sm font-black text-slate-900">Join queue</p>
              <p className="mt-1 text-xs text-slate-500">Uses the same token API as mobile.</p>
              <button className="ql-btn-primary mt-4 w-full" onClick={joinQueue} disabled={joining || details.shop.queuePaused}>
                <Ticket size={15} />
                {details.shop.queuePaused ? 'Queue paused' : joining ? 'Issuing...' : 'Get token'}
              </button>
            </div>

            <div className="ql-panel p-4">
              <p className="text-sm font-black text-slate-900">Book appointment</p>
              <div className="mt-3 grid gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-md border px-3 py-2 text-left text-xs font-bold ${selectedSlot === slot ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {format(new Date(slot), 'dd MMM, hh:mm a')}
                  </button>
                ))}
              </div>
              <button className="ql-btn-secondary mt-4 w-full" onClick={bookAppointment} disabled={booking || !selectedService}>
                <CalendarDays size={15} />
                {booking ? 'Booking...' : 'Book selected time'}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {payingAppointment ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-5 shadow-xl">
            <p className="text-lg font-black text-slate-950">Complete payment</p>
            <p className="mt-2 text-sm text-slate-500">Advance payment of Rs {payingAppointment.amount} is required.</p>
            <button className="ql-btn-primary mt-5 w-full bg-[#3399cc] hover:bg-[#2788b8]" onClick={verifyPayment} disabled={booking}>
              {booking ? 'Verifying...' : 'Pay with Razorpay'}
            </button>
            <button className="ql-btn-secondary mt-2 w-full" onClick={() => setPayingAppointment(null)} disabled={booking}>
              Pay later
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CustomerPortal() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [tab, setTab] = useState<PortalTab>('dashboard');
  const [shops, setShops] = useState<Shop[]>([]);
  const [trendingShops, setTrendingShops] = useState<Shop[]>([]);
  const [popularShops, setPopularShops] = useState<Shop[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [waitlists, setWaitlists] = useState<any[]>([]);
  const [loyalties, setLoyalties] = useState<LoyaltyData[]>([]);
  const [selectedShop, setSelectedShop] = useState<ShopDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [exploreLoading, setExploreLoading] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ shopId: string; shopName: string; tokenId?: string; appointmentId?: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newSchedule, setNewSchedule] = useState(toDateTimeLocal(new Date(Date.now() + 60 * 60 * 1000)));

  const activeTokens = tokens.filter(isActiveToken);
  const completedVisits = tokens.filter((token) => token.status === 'SERVED').length + appointments.filter((appointment) => appointment.status === 'COMPLETED').length;

  const loadHistory = useCallback(async (mounted = { current: true }) => {
    const [tokenRes, appointmentRes, waitlistRes] = await Promise.all([
      tokenApi.getMyHistory(0, 50), 
      appointmentApi.getMy(0, 50),
      waitlistApi.getMy().catch(() => ({ data: [] }))
    ]);
    if (!mounted.current) return;
    setTokens(tokenRes.data.content);
    setAppointments(appointmentRes.data.content);
    setWaitlists(waitlistRes.data || []);
    setWaitlists(waitlistRes.data || []);

    const shopIds = Array.from(new Set([...tokenRes.data.content.map((t: Token) => t.shopId), ...appointmentRes.data.content.map((a: Appointment) => a.shopId)]));
    const loyaltyResults = await Promise.allSettled(shopIds.map((shopId) => loyaltyApi.getMyLoyalty(shopId).then((res) => res.data as LoyaltyData)));
    if (!mounted.current) return;
    setLoyalties(loyaltyResults.filter((result): result is PromiseFulfilledResult<LoyaltyData> => result.status === 'fulfilled').map((result) => result.value));
  }, []);

  const loadShops = useCallback(async (search = query, mounted = { current: true }) => {
    const selectedCategory = category;
    setExploreLoading(true);
    try {
      if (search.trim()) {
        const [searchRes, trendingRes, popularRes] = await Promise.all([
          shopApi.searchPublic(search.trim()),
          shopApi.getTrending(selectedCategory, undefined, undefined, 10),
          shopApi.getPopular(selectedCategory, undefined, undefined, 10),
        ]);
        if (!mounted.current) return;
        setShops(searchRes.data);
        setTrendingShops(trendingRes.data);
        setPopularShops(popularRes.data);
        return;
      }

      const loadWithLocation = async (lat: number, lng: number) => {
        const [nearbyRes, trendingRes, popularRes] = await Promise.all([
          shopApi.getNearby(lat, lng, 25),
          shopApi.getTrending(selectedCategory, lat, lng, 10),
          shopApi.getPopular(selectedCategory, lat, lng, 10),
        ]);
        if (!mounted.current) return;
        setShops(nearbyRes.data);
        setTrendingShops(trendingRes.data);
        setPopularShops(popularRes.data);
        setLocationDenied(false);
      };

      const loadPopularFallback = async () => {
        const [popularRes, trendingRes] = await Promise.all([
          shopApi.getPopular(selectedCategory, undefined, undefined, 20),
          shopApi.getTrending(selectedCategory, undefined, undefined, 10),
        ]);
        if (!mounted.current) return;
        setShops(popularRes.data);
        setPopularShops(popularRes.data);
        setTrendingShops(trendingRes.data);
        setLocationDenied(true);
      };

      if ('geolocation' in navigator) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              loadWithLocation(position.coords.latitude, position.coords.longitude).finally(resolve);
            },
            () => {
              loadPopularFallback().finally(resolve);
            },
            { timeout: 5000 }
          );
        });
      } else {
        await loadPopularFallback();
      }
    } finally {
      if (mounted.current) setExploreLoading(false);
    }
  }, [category, query]);

  const reloadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadHistory(), loadShops(query)]);
    } finally {
      setLoading(false);
    }
  }, [loadHistory, loadShops, query]);

  useEffect(() => {
    const mounted = { current: true };
    const reloadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([loadHistory(mounted), loadShops(query, mounted)]);
      } finally {
        if (mounted.current) setLoading(false);
      }
    };
    reloadAll();
    return () => {
      mounted.current = false;
    };
  }, [loadHistory, loadShops, query]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadShops(query).catch(() => setShops([]));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, loadShops]);

  const openShop = async (shopId: string) => {
    try {
      const [shopRes, servicesRes, providersRes, queueRes] = await Promise.all([
        shopApi.getById(shopId),
        shopApi.getServices(shopId),
        providerApi.getByShop(shopId),
        tokenApi.getLiveQueue(shopId),
      ]);
      setSelectedShop({ shop: shopRes.data, services: servicesRes.data, providers: providersRes.data, queue: queueRes.data });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not load shop'));
    }
  };

  const cancelAppointment = async (appointment: Appointment) => {
    if (!window.confirm(`Cancel your booking at ${appointment.shopName}?`)) return;
    try {
      await appointmentApi.cancel(appointment.id, 'Cancelled by customer web');
      toast.success('Appointment cancelled');
      loadHistory();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not cancel appointment'));
    }
  };

  const rescheduleAppointment = async (event: FormEvent) => {
    event.preventDefault();
    if (!rescheduleTarget) return;
    try {
      await appointmentApi.reschedule(rescheduleTarget.id, { newScheduledAt: new Date(newSchedule).toISOString() });
      toast.success('Appointment rescheduled');
      setRescheduleTarget(null);
      loadHistory();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not reschedule appointment'));
    }
  };

  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    if (!reviewTarget) return;
    try {
      await reviewApi.create({
        shopId: reviewTarget.shopId,
        rating: reviewRating,
        comment: reviewComment || undefined,
        tokenId: reviewTarget.tokenId,
        appointmentId: reviewTarget.appointmentId,
      });
      toast.success('Review saved');
      setReviewTarget(null);
      setReviewRating(5);
      setReviewComment('');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not submit review'));
    }
  };

  const visibleShops = shops.filter((shop) => category === 'ALL' || shop.category === category);
  const totalPoints = loyalties.reduce((sum, item) => sum + item.points, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="QueueLess Logo" className="h-9 w-9 rounded object-cover" />
            <div>
              <p className="text-sm font-black">QueueLess</p>
              <p className="text-xs text-slate-500">Customer portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm font-semibold text-slate-600 sm:inline">{user?.name}</span>
            <button className="ql-btn-icon" onClick={() => { clearAuth(); window.location.href = '/login?account=customer'; }} aria-label="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {[
            ['dashboard', 'Dashboard', Ticket],
            ['discover', 'Explore', Compass],
            ['history', 'History', History],
            ['rewards', 'Rewards', Award],
            ['profile', 'Profile', User],
          ].map(([id, label, Icon]) => (
            <button key={id as string} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black ${tab === id ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setTab(id as PortalTab)}>
              <Icon size={15} />
              {label as string}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5">
        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center"><div className="ql-spinner" /></div>
        ) : null}

        {!loading && tab === 'dashboard' ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric icon={Ticket} label="Active tokens" value={activeTokens.length} />
              <Metric icon={History} label="Completed visits" value={completedVisits} />
              <Metric icon={Award} label="Loyalty points" value={totalPoints} />
            </div>
            {activeTokens.length ? (
              <div className="grid gap-4">
                {activeTokens.map((token) => <ActiveTokenCard key={token.id} token={token} onRefresh={loadHistory} onOpen={openShop} />)}
              </div>
            ) : (
              <div className="ql-empty">
                <Ticket className="mb-3 text-slate-400" />
                <p className="font-black text-slate-800">No active tokens</p>
                <p className="mt-1">Search for a shop and join a queue when you are ready.</p>
                <button className="ql-btn-primary mt-4" onClick={() => setTab('discover')}>Find a shop</button>
              </div>
            )}

            {waitlists.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-4 text-lg font-black text-slate-900">Your Waitlists</h3>
                <div className="grid gap-4">
                  {waitlists.map((w: any) => (
                    <div key={w.id} className="ql-panel flex items-center justify-between p-4 border-l-4 border-l-amber-400">
                      <div>
                        <p className="font-bold text-slate-900">{w.shopName}</p>
                        <p className="text-xs text-slate-500">Joined waitlist • You will be notified</p>
                      </div>
                      <button 
                        onClick={async () => {
                          if(!window.confirm('Leave waitlist?')) return;
                          try { await waitlistApi.leave(w.id); loadHistory(); toast.success('Left waitlist'); }
                          catch { toast.error('Failed to leave'); }
                        }}
                        className="ql-btn-secondary border-red-200 text-red-700 hover:bg-red-50 text-xs py-1 px-3 h-8 min-w-[60px]"
                      >
                        Leave
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        ) : null}

        {!loading && tab === 'discover' ? (
          <div className="space-y-5">
            <div className="ql-panel p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                <label className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
                  <input className="ql-field pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search shop, category, city, or area" />
                </label>
                <select className="ql-field" value={category} onChange={(event) => setCategory(event.target.value)}>
                  {SHOP_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {SHOP_CATEGORIES.map((item) => (
                  <button key={item} onClick={() => setCategory(item)} className={`ql-chip shrink-0 ${category === item ? 'border-slate-950 bg-slate-950 text-white' : ''}`}>
                    {item === 'ALL' ? 'All' : item[0] + item.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {exploreLoading ? (
              <div className="ql-panel p-5"><div className="ql-spinner mx-auto" /></div>
            ) : null}

            {!exploreLoading && trendingShops.length ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="ql-kicker">Customer discovery</p>
                    <h2 className="text-xl font-black text-slate-950">Trending now</h2>
                  </div>
                  <span className="ql-chip"><Star size={13} /> Frequently searched</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {trendingShops
                    .filter((shop) => category === 'ALL' || shop.category === category)
                    .map((shop) => <DiscoveryShopCard key={shop.id} shop={shop} onOpen={openShop} compact />)}
                </div>
              </section>
            ) : null}

            {!exploreLoading ? (
              <section className="space-y-3">
                <div>
                  <p className="ql-kicker">{query.trim() ? 'Search results' : locationDenied ? 'Popular fallback' : 'Nearby shops'}</p>
                  <h2 className="text-xl font-black text-slate-950">{query.trim() ? 'Matching shops' : locationDenied ? 'Popular shops' : 'Near you'}</h2>
                  {locationDenied && !query.trim() ? <p className="mt-1 text-sm text-slate-500">Location permission is off, so QueueLess is showing active popular branches.</p> : null}
                </div>
                {visibleShops.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {visibleShops.map((shop) => <DiscoveryShopCard key={shop.id} shop={shop} onOpen={openShop} />)}
                  </div>
                ) : (
                  <div className="ql-empty">
                    <MapPin className="mb-3 text-slate-400" />
                    <p className="font-black text-slate-800">No shops found</p>
                    <p className="mt-1">Try another category or search for a city, shop, or service.</p>
                  </div>
                )}
              </section>
            ) : null}

            {!exploreLoading && popularShops.length ? (
              <section className="space-y-3">
                <div>
                  <p className="ql-kicker">Frequently searched</p>
                  <h2 className="text-xl font-black text-slate-950">Popular shops</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {popularShops
                    .filter((shop) => category === 'ALL' || shop.category === category)
                    .slice(0, 6)
                    .map((shop) => <DiscoveryShopCard key={shop.id} shop={shop} onOpen={openShop} />)}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {!loading && tab === 'history' ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <HistoryPanel title="Token history">
              {tokens.map((token) => (
                <HistoryRow key={token.id} title={`${token.displayNumber} · ${token.shopName}`} meta={`${token.status} · ${format(new Date(token.issuedAt), 'dd MMM, hh:mm a')}`}>
                  {token.status === 'SERVED' ? <button className="ql-btn-secondary" onClick={() => setReviewTarget({ shopId: token.shopId, shopName: token.shopName, tokenId: token.id })}><Star size={14} /> Review</button> : null}
                </HistoryRow>
              ))}
            </HistoryPanel>
            <HistoryPanel title="Appointments">
              {appointments.map((appointment) => (
                <HistoryRow key={appointment.id} title={`${appointment.serviceName} · ${appointment.shopName}`} meta={`${appointment.status} · ${format(new Date(appointment.scheduledAt), 'dd MMM, hh:mm a')}`}>
                  {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' ? (
                    <>
                      <button className="ql-btn-secondary" onClick={() => { setRescheduleTarget(appointment); setNewSchedule(toDateTimeLocal(new Date(appointment.scheduledAt))); }}>Reschedule</button>
                      <button className="ql-btn-danger" onClick={() => cancelAppointment(appointment)}>Cancel</button>
                    </>
                  ) : null}
                  {appointment.status === 'COMPLETED' ? <button className="ql-btn-secondary" onClick={() => setReviewTarget({ shopId: appointment.shopId, shopName: appointment.shopName, appointmentId: appointment.id })}><Star size={14} /> Review</button> : null}
                </HistoryRow>
              ))}
            </HistoryPanel>
          </div>
        ) : null}

        {!loading && tab === 'rewards' ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric icon={Award} label="Total points" value={totalPoints} />
              <Metric icon={Compass} label="Reward shops" value={loyalties.length} />
              <Metric icon={Star} label="Gold tiers" value={loyalties.filter((item) => item.tier === 'GOLD').length} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {loyalties.map((loyalty) => <LoyaltyCard key={loyalty.shopId} loyalty={loyalty} />)}
            </div>
          </div>
        ) : null}

        {!loading && tab === 'profile' ? (
          <div className="ql-panel max-w-2xl p-5">
            <p className="ql-kicker">Account</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{user?.name}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MiniStat label="Phone" value={user?.phone ?? '-'} />
              <MiniStat label="Role" value={user?.role ?? '-'} />
              <MiniStat label="Visits" value={completedVisits} />
              <MiniStat label="Points" value={totalPoints} />
            </div>
            <button className="ql-btn-danger mt-5" onClick={() => { clearAuth(); window.location.href = '/login?account=customer'; }}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        ) : null}
      </main>
      
      <DashboardFooter />

      {selectedShop ? <ShopSheet details={selectedShop} activeToken={activeTokens.find((token) => token.shopId === selectedShop.shop.id)} onClose={() => setSelectedShop(null)} onChanged={reloadAll} /> : null}

      {reviewTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <form onSubmit={submitReview} className="w-full max-w-md rounded-md border border-slate-200 bg-white p-5 shadow-xl">
            <p className="text-lg font-black text-slate-950">Rate {reviewTarget.shopName}</p>
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setReviewRating(star)} className={star <= reviewRating ? 'text-amber-500' : 'text-slate-300'}>
                  <Star fill="currentColor" />
                </button>
              ))}
            </div>
            <textarea className="ql-field mt-4 min-h-28 resize-none" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="Comment optional" />
            <div className="mt-4 flex gap-2">
              <button type="button" className="ql-btn-secondary flex-1" onClick={() => setReviewTarget(null)}>Cancel</button>
              <button className="ql-btn-primary flex-1">Submit</button>
            </div>
          </form>
        </div>
      ) : null}

      {rescheduleTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <form onSubmit={rescheduleAppointment} className="w-full max-w-md rounded-md border border-slate-200 bg-white p-5 shadow-xl">
            <p className="text-lg font-black text-slate-950">Reschedule appointment</p>
            <label className="ql-label mt-4">New time</label>
            <input className="ql-field" type="datetime-local" value={newSchedule} onChange={(event) => setNewSchedule(event.target.value)} />
            <div className="mt-4 flex gap-2">
              <button type="button" className="ql-btn-secondary flex-1" onClick={() => setRescheduleTarget(null)}>Cancel</button>
              <button className="ql-btn-primary flex-1">Save</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="ql-panel p-4">
      <Icon className="text-slate-400" size={18} />
      <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function DiscoveryShopCard({ shop, onOpen, compact = false }: { shop: Shop; onOpen: (shopId: string) => void; compact?: boolean }) {
  return (
    <button
      className={`ql-card text-left transition hover:-translate-y-0.5 hover:shadow-md ${compact ? 'w-72 shrink-0' : ''}`}
      onClick={() => onOpen(shop.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-black text-slate-950">{shop.name}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={13} />
            <span className="truncate">{shop.address}, {shop.city}</span>
          </p>
        </div>
        <span className={`ql-chip shrink-0 ${shop.queuePaused ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {shop.queuePaused ? 'Paused' : 'Open queue'}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-md border border-slate-200">
        <MiniStat label="Waiting" value={shop.currentQueueSize ?? 0} />
        <MiniStat label="Avg" value={`${shop.avgServiceMins}m`} />
        <MiniStat label="Distance" value={shop.distanceKm != null ? `${shop.distanceKm}km` : '-'} />
      </div>
    </button>
  );
}

function HistoryPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ql-panel">
      <div className="ql-panel-head"><p className="text-sm font-black text-slate-900">{title}</p></div>
      <div>{children}</div>
    </section>
  );
}

function HistoryRow({ title, meta, children }: { title: string; meta: string; children?: React.ReactNode }) {
  return (
    <div className="ql-row flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-black text-slate-950">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{meta}</p>
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

function LoyaltyCard({ loyalty }: { loyalty: LoyaltyData }) {
  const next = loyalty.tier === 'GOLD' ? null : loyalty.tier === 'SILVER' ? loyalty.goldThreshold : loyalty.tier === 'BRONZE' ? loyalty.silverThreshold : loyalty.bronzeThreshold;
  const progress = next ? Math.min(100, (loyalty.points / next) * 100) : 100;
  return (
    <div className="ql-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-950">{loyalty.shopName ?? 'Shop rewards'}</p>
          <p className="mt-1 text-xs text-slate-500">{loyalty.totalVisits} completed visits</p>
        </div>
        <span className="ql-chip border-amber-200 bg-amber-50 text-amber-700">{loyalty.tier}</span>
      </div>
      <p className="mt-4 text-3xl font-black text-slate-950">{loyalty.points}</p>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">points</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-amber-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
