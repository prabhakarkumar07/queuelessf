import { motion } from 'framer-motion';
import { METRICS } from './data';
import { Shield, Zap, Clock, Users } from 'lucide-react';
import { staggerContainer, staggerItem, fadeUp, viewport } from './motion';
import { useState, useEffect, useRef } from 'react';

const BENEFITS = [
  { icon: Clock, title: 'Reduce wait times by 40%', description: 'Customers arrive just in time instead of sitting in waiting rooms.' },
  { icon: Users, title: 'Serve 30% more customers', description: 'Eliminate no-shows and idle gaps with smart queue management.' },
  { icon: Zap, title: 'Staff efficiency up 2x', description: 'One-click call-next, auto-routing, and zero paper token books.' },
  { icon: Shield, title: 'Enterprise-grade reliability', description: 'PostgreSQL, Redis-backed rate limiting, and WebSocket failover.' },
];

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedMetric({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [counted, setCounted] = useState(false);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted) {
          setCounted(true);
          // Extract numeric part from value string (e.g. "99.9%" -> 99.9)
          const match = value.match(/[\d.]+/);
          if (!match) {
            setDisplay(value);
            return;
          }
          const target = parseFloat(match[0]);
          const prefix = value.startsWith('<') ? '<' : '';
          const suffix = value.replace(/[<\d.]+/, '');
          let start = 0;
          const duration = 1400;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + eased * (target - start);
            setDisplay(
              `${prefix}${Number.isInteger(target) ? Math.round(current) : current.toFixed(1)}${suffix}`
            );
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [counted, value]);

  return (
    <div ref={ref} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className="text-xl font-black text-slate-900 sm:text-2xl tabular-nums">{display || value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

export default function TrustSection() {
  return (
    <section id="trust" className="px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Animated Metrics bar */}
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {METRICS.map((metric) => (
            <motion.div key={metric.label} variants={staggerItem}>
              <AnimatedMetric value={metric.value} label={metric.label} />
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits */}
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="mb-8 max-w-2xl"
        >
          <motion.p variants={fadeUp} className="ql-kicker mb-2">
            Why QueueLess
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            Measurable impact from day one
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.09)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid gap-4 sm:grid-cols-2"
        >
          {BENEFITS.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={staggerItem}
              whileHover={{ x: 4, transition: { duration: 0.18 } }}
              className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 cursor-default"
            >
              <motion.div
                whileHover={{ rotate: 12, scale: 1.1, transition: { type: 'spring', stiffness: 400 } }}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white"
              >
                <benefit.icon className="h-4 w-4 text-slate-700" strokeWidth={2} />
              </motion.div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{benefit.title}</h3>
                <p className="mt-1 text-[12px] leading-4 text-slate-500">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
