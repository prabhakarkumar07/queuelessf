import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS } from './data';
import { useAuthStore } from '../../store/authStore';

function calculateNavOpacity(scrollY: number): number {
  const THRESHOLD = 80;
  if (scrollY <= 0) return 0;
  if (scrollY >= THRESHOLD) return 1;
  return scrollY / THRESHOLD;
}

function scrollToSection(sectionId: string) {
  const id = sectionId.replace('#', '');
  const el = document.getElementById(id);
  if (!el) return;
  const navHeight = 64;
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top, behavior: 'smooth' });
}

export function LandingNav() {
  const navigate = useNavigate();
  const [opacity, setOpacity] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'CUSTOMER') return '/customer';
    if (user.role === 'SERVICE_PROVIDER') return '/staff';
    if (['SUPER_ADMIN', 'OPS_ADMIN', 'SUPPORT_AGENT', 'FINANCE_ADMIN'].includes(user.role)) return '/admin';
    return '/dashboard';
  };

  const handleScroll = useCallback(() => {
    setOpacity(calculateNavOpacity(window.scrollY));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      scrollToSection(href);
    } else {
      navigate(href);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-150"
      style={{ backgroundColor: `rgba(255, 255, 255, ${opacity * 0.95})`, borderBottom: opacity > 0.5 ? '1px solid #e2e8f0' : '1px solid transparent' }}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded">
          <img src="/logo.png" alt="QueueLess Logo" className="h-8 w-8 rounded object-cover" />
          <span className="text-[15px] font-bold tracking-tight text-slate-900">QueueLess</span>
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="rounded-md px-3 py-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <button
              onClick={() => navigate(getDashboardLink())}
              className="ql-btn-primary px-4 py-2 text-[13px]"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="rounded-md px-3.5 py-2 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="ql-btn-primary px-4 py-2 text-[13px]"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu — animated */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
          >
            <div className="px-4 pb-4 pt-2">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full rounded-md px-3 py-2.5 text-left text-[14px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </motion.button>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                {isAuthenticated ? (
                  <button
                    onClick={() => { setMobileOpen(false); navigate(getDashboardLink()); }}
                    className="ql-btn-primary w-full py-2.5 text-[13px]"
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setMobileOpen(false); navigate('/login'); }}
                      className="flex items-center justify-center gap-2 w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700"
                    >
                      <img src="/logo.png" alt="QueueLess Logo" className="h-7 w-7 rounded object-cover" />
                      Login
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); navigate('/register'); }}
                      className="ql-btn-primary w-full py-2.5 text-[13px]"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
