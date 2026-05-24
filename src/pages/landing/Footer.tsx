import { FOOTER_COLUMNS } from './data';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="QueueLess" className="h-7 w-7 rounded object-cover" />
              <span className="text-[14px] font-bold tracking-tight text-slate-900">QueueLess</span>
            </Link>
            <p className="mt-3 max-w-xs text-[12px] leading-5 text-slate-500">
              Digital queue and appointment management for walk-in service businesses across India.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="https://twitter.com/queueless" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-blue-500 transition-colors text-[10px] font-bold">
                X
              </a>
              <a href="https://instagram.com/queueless" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-pink-600 transition-colors text-[10px] font-bold">
                IG
              </a>
              <a href="https://linkedin.com/company/queueless" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-blue-700 transition-colors text-[10px] font-bold">
                IN
              </a>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[12px] text-slate-500">
              <Mail className="h-3.5 w-3.5" />
              <a href="mailto:hello@queueless.in" className="hover:text-slate-900 transition-colors">hello@queueless.in</a>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">{column.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('http') || link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-[13px] text-slate-500 transition-colors hover:text-slate-900"
                        {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-[13px] text-slate-500 transition-colors hover:text-slate-900"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-[12px] text-slate-400">
            © {new Date().getFullYear()} QueueLess Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-slate-400">
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            <Link to="/refund" className="hover:text-slate-900 transition-colors">Refund Policy</Link>
            <span className="flex items-center gap-1.5 ml-2">Made in India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
