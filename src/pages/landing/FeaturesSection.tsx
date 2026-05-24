import { motion } from 'framer-motion';
import { FEATURES } from './data';
import { fadeUp, staggerContainer, staggerItem, viewport } from './motion';

export default function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="mb-10 max-w-2xl"
        >
          <motion.p variants={fadeUp} className="ql-kicker mb-2">
            Capabilities
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            Everything you need to run a queue
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-sm leading-relaxed text-slate-500">
            From issuing tokens to analyzing daily throughput — one platform for your entire
            customer flow.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.07, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="ql-card group relative cursor-default"
            >
              <div className="mb-3 flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 transition-colors group-hover:border-slate-300 group-hover:bg-slate-100"
                >
                  <feature.icon className="h-4.5 w-4.5 text-slate-700" strokeWidth={2} />
                </motion.div>
                {feature.highlight && (
                  <span className="ql-chip text-[10px]">{feature.highlight}</span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-1.5 text-[13px] leading-5 text-slate-500">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
