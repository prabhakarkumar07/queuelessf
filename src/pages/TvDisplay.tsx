import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { shopApi, tokenApi } from '../lib/api';
import { useQueueSocket } from '../hooks/useQueueSocket';
import type { LiveQueue, QueueUpdateEvent, Shop } from '../types';

const APP_URL = import.meta.env.VITE_APP_URL ?? window.location.origin;

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return <span>{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>;
}

function AnimatedToken({ token }: { token: string }) {
  const [display, setDisplay] = useState(token);
  const [animating, setAnimating] = useState(false);
  const prevRef = useRef(token);

  useEffect(() => {
    if (token !== prevRef.current) {
      setAnimating(true);
      const id = setTimeout(() => {
        setDisplay(token);
        setAnimating(false);
      }, 220);
      prevRef.current = token;
      return () => clearTimeout(id);
    }
  }, [token]);

  return (
    <div className={`transition duration-200 ${animating ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100'}`}>
      <div className="text-[17vw] font-black leading-none tracking-tight text-white">{display}</div>
    </div>
  );
}

export default function TvDisplay() {
  const { shopId } = useParams<{ shopId: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [queue, setQueue] = useState<LiveQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    Promise.all([shopApi.getById(shopId), tokenApi.getLiveQueue(shopId)])
      .then(([shopRes, queueRes]) => {
        setShop(shopRes.data);
        setQueue(queueRes.data);
      })
      .finally(() => setLoading(false));
  }, [shopId]);

  const handleQueueUpdate = useCallback((event: QueueUpdateEvent) => {
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
  }, []);

  const socketState = useQueueSocket({ shopId: shopId ?? 'none', onUpdate: handleQueueUpdate });

  useEffect(() => setWsConnected(socketState.connected), [socketState.connected]);

  useEffect(() => {
    if (!shopId) return;
    const id = setInterval(() => tokenApi.getLiveQueue(shopId).then(({ data }) => setQueue(data)).catch(() => {}), 30000);
    return () => clearInterval(id);
  }, [shopId]);

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950">
        <div className="ql-spinner" />
      </div>
    );
  }

  const currentToken = queue?.currentTokenDisplay ?? '-';
  const servingToken = queue?.waitingTokens.find((token) => token.status === 'SERVING' || token.status === 'ARRIVED' || token.status === 'CALLED') ?? null;
  const upNext = queue?.waitingTokens.filter((token) => token.status === 'WAITING').slice(0, 5) ?? [];

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#11100e] text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-[#171512] px-8 py-5 xl:px-12">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500 text-sm font-black text-stone-950">QL</div>
          <div className="min-w-0">
            <p className="truncate text-xl font-black leading-tight">{shop?.name}</p>
            <p className="truncate text-sm text-white/45">{shop?.city}</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button onClick={handleFullscreen} className="rounded-md border border-white/15 px-3 py-2 text-sm font-bold text-white/70 transition hover:border-white/30 hover:text-white">
            Full screen
          </button>
          <div className="flex items-center gap-2">
            <span className={`ql-live-dot h-2.5 w-2.5 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-sm font-semibold text-white/45">{wsConnected ? 'Live' : 'Reconnecting'}</span>
          </div>
          <div className="font-mono text-2xl text-white/70"><Clock /></div>
        </div>
      </header>

      <main className="grid h-[calc(100vh-81px)] grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex flex-col items-center justify-center px-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.24em] text-white/45">Now serving</p>
          <AnimatedToken token={currentToken} />

          {servingToken ? (
            <div className="mt-3 text-center">
              <p className="text-2xl font-bold">{servingToken.userName || 'Customer'}</p>
              <p className="text-lg text-white/50">
                {servingToken.serviceName ?? 'General queue'}
                {servingToken.providerName ? ` · ${servingToken.providerName}` : ''}
              </p>
            </div>
          ) : null}

          {queue?.queuePaused ? (
            <div className="mt-5 rounded-md border border-red-400/30 bg-red-500/15 px-6 py-2 text-lg font-bold text-red-200">Queue paused</div>
          ) : null}

          <div className="mt-9 grid grid-cols-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
            <div className="border-r border-white/10 px-8 py-4 text-center">
              <p className="text-5xl font-black text-blue-300">{queue?.totalWaiting ?? 0}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/40">Waiting</p>
            </div>
            <div className="border-r border-white/10 px-8 py-4 text-center">
              <p className="text-5xl font-black text-emerald-300">{queue?.totalServedToday ?? 0}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/40">Served</p>
            </div>
            <div className="px-8 py-4 text-center">
              <p className="text-5xl font-black text-amber-300">{shop?.avgServiceMins ?? 0}m</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/40">Avg wait</p>
            </div>
          </div>
        </section>

        <aside className="flex flex-col justify-between border-l border-white/10 bg-[#171512] px-7 py-8">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-white/40">Up next</p>
            <div className="space-y-2">
              {upNext.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/30">Queue is empty</div>
              ) : (
                upNext.map((token, index) => (
                  <div key={token.id} className={`grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-md border px-3 py-3 ${index === 0 ? 'border-amber-400/30 bg-amber-400/10' : 'border-white/10 bg-white/[0.04]'}`}>
                    <span className="text-xl font-black">{token.displayNumber}</span>
                    <span className="truncate text-sm text-white/60">{token.userName || 'Customer'}</span>
                    {token.estimatedWaitMins !== undefined ? <span className="text-xs font-bold text-white/30">{token.estimatedWaitMins}m</span> : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="inline-block rounded-md bg-white p-3">
              <QRCodeSVG value={`${APP_URL}/shop/${shopId}`} size={116} bgColor="#ffffff" fgColor="#1c1917" level="M" />
            </div>
            <p className="mt-3 text-xs font-semibold text-white/35">Scan to get your token</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
