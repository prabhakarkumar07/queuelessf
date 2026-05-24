import { useEffect, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { easeOut, fadeUp } from './motion';

// ── Live queue simulation data ────────────────────────────────────────────────
const QUEUE_STATES = [
  {
    serving: 'A-07',
    servedToday: 12,
    waiting: 5,
    rows: [
      { token: 'A-08', name: 'Priya S.', wait: '~4 min', status: 'Called' },
      { token: 'A-09', name: 'Rahul M.', wait: '~9 min', status: 'Waiting' },
      { token: 'A-10', name: 'Anita K.', wait: '~14 min', status: 'Waiting' },
    ],
    myToken: 'A-09',
    myAhead: 2,
    myWait: '~9 min',
  },
  {
    serving: 'A-08',
    servedToday: 13,
    waiting: 4,
    rows: [
      { token: 'A-09', name: 'Rahul M.', wait: '~4 min', status: 'Called' },
      { token: 'A-10', name: 'Anita K.', wait: '~9 min', status: 'Waiting' },
      { token: 'A-11', name: 'Deepak R.', wait: '~14 min', status: 'Waiting' },
    ],
    myToken: 'A-09',
    myAhead: 1,
    myWait: '~4 min',
  },
  {
    serving: 'A-09',
    servedToday: 14,
    waiting: 3,
    rows: [
      { token: 'A-09', name: 'Rahul M.', wait: '—', status: 'Serving' },
      { token: 'A-10', name: 'Anita K.', wait: '~4 min', status: 'Called' },
      { token: 'A-11', name: 'Deepak R.', wait: '~9 min', status: 'Waiting' },
    ],
    myToken: 'A-09',
    myAhead: 0,
    myWait: 'Now!',
  },
];

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'Serving'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : status === 'Called'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-slate-50 text-slate-500 border-slate-200';
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${color}`}>
      {status}
    </span>
  );
}

function LiveDashboardMockup() {
  const [stateIdx, setStateIdx] = useState(0);
  const shouldReduce = useReducedMotion();
  const state = QUEUE_STATES[stateIdx];

  useEffect(() => {
    if (shouldReduce) return;
    const timer = setInterval(() => {
      setStateIdx((i) => (i + 1) % QUEUE_STATES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [shouldReduce]);

  const tickerActive = state.myAhead === 0;

  return (
    <div className="ql-panel overflow-hidden rounded-xl p-1 shadow-xl shadow-slate-200/60">
      <div className="rounded-lg bg-slate-50 p-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="QueueLess" className="h-5 w-5 rounded object-cover" />
            <span className="text-xs font-bold text-slate-700">Star Clinic — Dashboard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-slate-500">Live</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          {/* Now Serving */}
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={state.serving}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="text-lg font-black text-slate-900"
              >
                {state.serving}
              </motion.p>
            </AnimatePresence>
            <p className="text-[10px] font-semibold text-slate-500">Now Serving</p>
          </div>
          {/* Served Today */}
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={state.servedToday}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.28, ease: easeOut }}
                className="text-lg font-black text-emerald-600"
              >
                {state.servedToday}
              </motion.p>
            </AnimatePresence>
            <p className="text-[10px] font-semibold text-slate-500">Served Today</p>
          </div>
          {/* Waiting */}
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={state.waiting}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.28, ease: easeOut }}
                className="text-lg font-black text-blue-600"
              >
                {state.waiting}
              </motion.p>
            </AnimatePresence>
            <p className="text-[10px] font-semibold text-slate-500">Waiting</p>
          </div>
        </div>

        {/* Queue list */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Queue
            </span>
          </div>
          <AnimatePresence initial={false}>
            {state.rows.map((row) => (
              <motion.div
                key={row.token}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.35, ease: easeOut }}
                className={`flex items-center gap-3 border-b border-slate-50 px-3 py-2 last:border-b-0 ${
                  row.status === 'Serving' ? 'bg-blue-50/50' : ''
                }`}
              >
                <span className="w-8 text-xs font-black text-slate-900">{row.token}</span>
                <span className="flex-1 truncate text-xs text-slate-600">{row.name}</span>
                <span className="text-[10px] text-slate-400">{row.wait}</span>
                <StatusBadge status={row.status} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating mobile token card */}
      <motion.div
        initial={{ opacity: 0, y: 20, x: -10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: easeOut }}
        className="absolute -bottom-4 -left-6 w-48 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl shadow-slate-200/60"
      >
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Your Token</p>
        <p className="text-2xl font-black text-slate-900">{state.myToken}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <motion.span
            animate={tickerActive ? { scale: [1, 1.4, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              tickerActive ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
          />
          <AnimatePresence mode="wait">
            <motion.span
              key={state.myAhead}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
              className={`text-[10px] font-semibold ${
                tickerActive ? 'text-emerald-600' : 'text-blue-600'
              }`}
            >
              {tickerActive
                ? 'Your turn!'
                : `${state.myAhead} ahead · ${state.myWait}`}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden px-4 pt-24 pb-20 sm:px-6 lg:pt-32 lg:pb-28">
      {/* Subtle background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white/60 to-white"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div className="max-w-xl">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="ql-kicker mb-3"
            >
              Queue Management Platform
            </motion.p>

            <motion.h1
              custom={1}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: easeOut, delay: 0.08 }}
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
            >
              Stop losing customers to long wait times
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut, delay: 0.16 }}
              className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg"
            >
              Digital tokens, live queue tracking, and smart notifications for clinics, salons,
              banks, and walk-in businesses across India.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut, delay: 0.24 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <motion.button
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="ql-btn-primary gap-2 px-5 py-2.5 text-sm"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </motion.button>
              <motion.button
                onClick={() => navigate('/shop/demo')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="ql-btn-secondary gap-2 px-5 py-2.5 text-sm"
              >
                <Play className="h-4 w-4" />
                See Demo
              </motion.button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.38 }}
              className="mt-4 text-xs text-slate-400"
            >
              No credit card required. Free for single-branch shops.
            </motion.p>

            {/* Live activity ticker */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 w-fit"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-600">
                <LiveTicker />
              </span>
            </motion.div>
          </div>

          {/* Product Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: easeOut, delay: 0.18 }}
            className="relative pb-8 pl-0 lg:pl-4"
          >
            <LiveDashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Live ticker ────────────────────────────────────────────────────────────────
const TICKER_MESSAGES = [
  '847 tokens issued in the last hour',
  'Rahul M. just joined Star Clinic queue',
  'Dr. Sharma served 14 patients today',
  'City Bank called token B-22',
  'Priya S. rated her experience ★★★★★',
  'A-11 just arrived at Star Salon',
];

function LiveTicker() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TICKER_MESSAGES.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={idx}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22 }}
      >
        {TICKER_MESSAGES[idx]}
      </motion.span>
    </AnimatePresence>
  );
}
