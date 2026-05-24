import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, viewport } from './motion';

const TRUST_ITEMS = [
  '✓ Free single-branch plan',
  '✓ No credit card required',
  '✓ Setup in under 5 minutes',
];

export default function PricingCTA() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={viewport}
          transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
          className="overflow-hidden rounded-2xl bg-slate-900 px-6 py-12 text-center sm:px-12 sm:py-16 relative"
        >
          {/* Subtle radial glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                'radial-gradient(ellipse 60% 40% at 50% 0%, #6366f1 0%, transparent 70%)',
            }}
          />

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="relative text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Ready to eliminate your waiting room?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.42, delay: 0.18 }}
            className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400"
          >
            Start free with a single branch. Upgrade when you grow. No setup fees, no contracts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.42, delay: 0.26 }}
            className="relative mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <motion.button
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
            >
              Login to Dashboard
            </motion.button>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.08, 0.35)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {TRUST_ITEMS.map((item) => (
              <motion.span
                key={item}
                variants={staggerItem}
                className="text-[12px] text-slate-500"
              >
                {item}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
