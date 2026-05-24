import { useEffect, useState } from 'react';
import { Monitor, Smartphone, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SHOWCASE_ITEMS } from './data';
import { fadeUp, staggerContainer, staggerItem, viewport, easeOut } from './motion';

// ── Animated Owner Dashboard Mockup ──────────────────────────────────────────
const DASHBOARD_QUEUE = [
  { token: 'A-07', name: 'Meera D.', status: 'Serving', wait: '—' },
  { token: 'A-08', name: 'Priya S.', status: 'Called', wait: '4m' },
  { token: 'A-09', name: 'Rahul M.', status: 'Waiting', wait: '9m' },
];
const DASHBOARD_QUEUE_2 = [
  { token: 'A-08', name: 'Priya S.', status: 'Serving', wait: '—' },
  { token: 'A-09', name: 'Rahul M.', status: 'Called', wait: '4m' },
  { token: 'A-10', name: 'Anita K.', status: 'Waiting', wait: '9m' },
];

function OwnerDashMockup() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 3000);
    return () => clearInterval(t);
  }, []);
  const queue = tick % 2 === 0 ? DASHBOARD_QUEUE : DASHBOARD_QUEUE_2;
  const served = 12 + tick;

  return (
    <div className="rounded-lg bg-white shadow-sm border border-slate-200 p-3 text-left">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-700">Owner Dashboard</span>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span className="text-[9px] text-slate-500">Live</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <div className="rounded-md bg-slate-50 border border-slate-100 p-1.5 text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={tick % 2}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-black text-slate-900 block"
            >
              {tick % 2 === 0 ? 'A-07' : 'A-08'}
            </motion.span>
          </AnimatePresence>
          <span className="text-[8px] text-slate-500">Serving</span>
        </div>
        <div className="rounded-md bg-slate-50 border border-slate-100 p-1.5 text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={served}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.22 }}
              className="text-sm font-black text-emerald-600 block"
            >
              {served}
            </motion.span>
          </AnimatePresence>
          <span className="text-[8px] text-slate-500">Served</span>
        </div>
        <div className="rounded-md bg-slate-50 border border-slate-100 p-1.5 text-center">
          <span className="text-sm font-black text-blue-600 block">3</span>
          <span className="text-[8px] text-slate-500">Waiting</span>
        </div>
      </div>
      <div className="rounded-md border border-slate-100 overflow-hidden">
        <AnimatePresence initial={false}>
          {queue.map((row) => (
            <motion.div
              key={row.token}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.28 }}
              className={`flex items-center gap-2 px-2 py-1 text-[9px] border-b border-slate-50 last:border-0 ${
                row.status === 'Serving' ? 'bg-blue-50/60' : ''
              }`}
            >
              <span className="font-black text-slate-800 w-7">{row.token}</span>
              <span className="flex-1 text-slate-600 truncate">{row.name}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold border ${
                  row.status === 'Serving'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : row.status === 'Called'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                {row.status}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Animated Customer Mobile Mockup ───────────────────────────────────────────
function CustomerMobileMockup() {
  const [position, setPosition] = useState(3);
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setPosition((p) => {
        if (p <= 1) {
          setNotified(true);
          setTimeout(() => setNotified(false), 2000);
          return 3;
        }
        return p - 1;
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-3 text-center mx-auto max-w-[160px]">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Your Token</p>
      <div className="flex items-center justify-center mb-1">
        <p className="text-3xl font-black text-slate-900">A-09</p>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-2">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
          animate={{ width: `${((4 - position) / 3) * 100}%` }}
          transition={{ duration: 0.6, ease: easeOut }}
        />
      </div>

      <AnimatePresence mode="wait">
        {notified ? (
          <motion.div
            key="notified"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1.5"
          >
            <p className="text-[9px] font-bold text-emerald-700">🎉 Your turn!</p>
            <p className="text-[8px] text-emerald-600">Walk in now</p>
          </motion.div>
        ) : (
          <motion.div
            key={position}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.22 }}
          >
            <p className="text-[11px] font-semibold text-blue-600">
              {position} ahead · ~{position * 4}m
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Animated TV Display Mockup ────────────────────────────────────────────────
const TV_TOKENS = ['A-07', 'A-08', 'A-09', 'A-10', 'A-11'];

function TvDisplayMockup() {
  const [nowIdx, setNowIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNowIdx((i) => (i + 1) % TV_TOKENS.length), 2800);
    return () => clearInterval(t);
  }, []);

  const now = TV_TOKENS[nowIdx];
  const upcoming = TV_TOKENS.slice(nowIdx + 1, nowIdx + 4);

  return (
    <div className="rounded-lg bg-slate-900 p-3 text-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
          Now Serving
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={now}
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.32, ease: easeOut }}
          className="text-4xl font-black text-white tracking-wide text-center mb-3 py-2"
        >
          {now}
        </motion.div>
      </AnimatePresence>
      <div className="border-t border-slate-700 pt-2">
        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Up Next</p>
        <div className="flex gap-2">
          {upcoming.map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 - i * 0.25 }}
              transition={{ delay: i * 0.07 }}
              className="flex-1 rounded bg-slate-800 py-1 text-center text-[10px] font-black text-slate-300"
            >
              {t}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MOCKUP_COMPONENTS = [OwnerDashMockup, CustomerMobileMockup, TvDisplayMockup];
const ICONS = [Monitor, Smartphone, Tv];

export default function DashboardShowcase() {
  return (
    <section className="border-t border-slate-100 bg-white px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="mb-10 max-w-2xl"
        >
          <motion.p variants={fadeUp} className="ql-kicker mb-2">
            Product
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            One platform, every screen
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-sm leading-relaxed text-slate-500">
            Owner dashboard, customer mobile app, and TV display — all connected in real time.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SHOWCASE_ITEMS.map((item, i) => {
            const MockupComponent = MOCKUP_COMPONENTS[i];
            const Icon = ICONS[i] ?? Monitor;
            return (
              <motion.div
                key={item.title}
                variants={staggerItem}
                className="group"
              >
                {/* Animated live mockup */}
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.22 } }}
                  className="relative mb-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition-shadow group-hover:shadow-lg p-3"
                >
                  {/* Screen label */}
                  <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-100">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 h-3 mx-2 rounded bg-slate-100 flex items-center justify-center">
                      <span className="text-[7px] text-slate-400 font-medium">app.queueless.in</span>
                    </div>
                    <Icon className="h-3 w-3 text-slate-400" />
                  </div>

                  {/* Live animated mockup */}
                  <MockupComponent />
                </motion.div>

                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-[13px] leading-5 text-slate-500">{item.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
