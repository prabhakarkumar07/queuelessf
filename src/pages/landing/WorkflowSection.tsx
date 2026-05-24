import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { WORKFLOW_STEPS } from './data';
import { fadeUp, staggerContainer, staggerItem, easeOut, viewport } from './motion';

export default function WorkflowSection() {
  const lineRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(lineRef, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="mb-12 text-center"
        >
          <motion.p variants={fadeUp} className="ql-kicker mb-2">
            How it works
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            From scan to served in 5 steps
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-500"
          >
            Your customers never wait in a physical line again. The entire flow happens on their
            phone.
          </motion.p>
        </motion.div>

        {/* Desktop: horizontal */}
        <div className="hidden lg:block">
          <div ref={lineRef} className="relative flex items-start justify-between">
            {/* Animated connecting line */}
            <div className="absolute top-6 left-[10%] right-[10%] h-px bg-slate-100" aria-hidden />
            <motion.div
              className="absolute top-6 left-[10%] h-px bg-slate-300 origin-left"
              initial={{ scaleX: 0 }}
              animate={lineInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, ease: easeOut, delay: 0.3 }}
              style={{ right: '10%' }}
              aria-hidden
            />
            {/* Animated progress fill */}
            <motion.div
              className="absolute top-6 left-[10%] h-px origin-left"
              style={{
                right: '10%',
                background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
              }}
              initial={{ scaleX: 0 }}
              animate={lineInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.4, ease: easeOut, delay: 0.5 }}
              aria-hidden
            />

            {WORKFLOW_STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: easeOut, delay: 0.1 + i * 0.1 }}
                className="relative flex w-1/5 flex-col items-center text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.12, transition: { type: 'spring', stiffness: 300 } }}
                  className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 bg-white shadow-sm"
                >
                  <step.icon className="h-5 w-5 text-slate-700" strokeWidth={2} />
                  {/* Step number badge */}
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[8px] font-bold text-white">
                    {step.step}
                  </span>
                </motion.div>
                <div className="mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Step {step.step}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-[12px] leading-4 text-slate-500">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet: vertical */}
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="lg:hidden"
        >
          <div className="relative ml-6 border-l border-slate-200 pl-8">
            {WORKFLOW_STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                variants={staggerItem}
                className={`relative pb-8 ${i === WORKFLOW_STEPS.length - 1 ? 'pb-0' : ''}`}
              >
                {/* Dot on line */}
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  className="absolute -left-[calc(2rem+1px)] top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-white shadow-sm"
                >
                  <step.icon className="h-4 w-4 text-slate-700" strokeWidth={2} />
                </motion.div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Step {step.step}
                  </span>
                  <h3 className="mt-0.5 text-sm font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-[13px] leading-5 text-slate-500">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
