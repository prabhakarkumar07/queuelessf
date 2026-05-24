import { motion } from 'framer-motion';
import { INDUSTRIES } from './data';
import { fadeUp, staggerContainer, staggerItem, viewport } from './motion';

// Industry-specific accent colors
const INDUSTRY_COLORS: Record<string, string> = {
  'Clinics & Hospitals': 'text-rose-600 bg-rose-50 border-rose-100',
  'Banks & Finance': 'text-blue-600 bg-blue-50 border-blue-100',
  'Salons & Spas': 'text-purple-600 bg-purple-50 border-purple-100',
  Restaurants: 'text-amber-600 bg-amber-50 border-amber-100',
  'Government Offices': 'text-slate-600 bg-slate-50 border-slate-200',
  'Retail & Service Centers': 'text-emerald-600 bg-emerald-50 border-emerald-100',
};

export default function IndustrySection() {
  return (
    <section id="industries" className="border-t border-slate-100 bg-white px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="mb-10 max-w-2xl"
        >
          <motion.p variants={fadeUp} className="ql-kicker mb-2">
            Industries
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            Built for queue-heavy businesses
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-sm leading-relaxed text-slate-500">
            Whether you run a clinic with 50 patients a day or a bank branch with 8 counters —
            QueueLess adapts to your workflow.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.07, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {INDUSTRIES.map((industry) => {
            const accent = INDUSTRY_COLORS[industry.category] ?? 'text-slate-600 bg-slate-50 border-slate-200';
            return (
              <motion.div
                key={industry.category}
                variants={staggerItem}
                whileHover={{ y: -3, boxShadow: '0 4px 16px 0 rgba(0,0,0,0.06)', transition: { duration: 0.22 } }}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:bg-white cursor-default"
              >
                <div className="mb-3 flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.12, rotate: -6, transition: { type: 'spring', stiffness: 300 } }}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border ${accent}`}
                  >
                    <industry.icon className="h-4.5 w-4.5" strokeWidth={2} />
                  </motion.div>
                  <h3 className="text-sm font-bold text-slate-900">{industry.category}</h3>
                </div>
                <p className="text-[13px] leading-5 text-slate-600">{industry.scenario}</p>
                <ul className="mt-3 space-y-1.5">
                  {industry.benefits.map((benefit, bi) => (
                    <motion.li
                      key={benefit}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: bi * 0.06, duration: 0.3 }}
                      className="flex items-start gap-2 text-[12px] text-slate-500"
                    >
                      <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300" />
                      {benefit}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
