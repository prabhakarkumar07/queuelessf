/**
 * Shared Framer Motion variants and easing curves for the QueueLess landing page.
 * Keep all motion definitions here so every component uses a consistent design system.
 */

// ── Easing curves ────────────────────────────────────────────────────────────
// A smooth, professional ease that feels like Linear/Stripe
export const ease = [0.25, 0.1, 0.25, 1] as const;
export const easeOut = [0, 0, 0.2, 1] as const;
export const spring = { type: 'spring', stiffness: 260, damping: 30 } as const;
export const softSpring = { type: 'spring', stiffness: 120, damping: 20 } as const;

// ── Scroll-triggered fade + slide up ─────────────────────────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

// ── Stagger container ─────────────────────────────────────────────────────────
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
});

// ── Stagger children ──────────────────────────────────────────────────────────
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

// ── Hero text ─────────────────────────────────────────────────────────────────
export const heroText = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut, delay: i * 0.1 },
  }),
};

// ── Scale in (for cards) ─────────────────────────────────────────────────────
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: easeOut },
  },
};

// ── Viewport config ────────────────────────────────────────────────────────
export const viewport = { once: true, margin: '-80px' } as const;
