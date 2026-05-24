import { Link } from 'react-router-dom';

export function DashboardFooter() {
  return (
    <footer className="mt-auto border-t border-slate-100 px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-2 sm:flex-row">
        <p className="text-[12px] font-medium text-slate-400">
          © {new Date().getFullYear()} QueueLess. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-[12px] font-medium text-slate-400">
          <Link to="/terms" className="transition-colors hover:text-slate-600">Terms</Link>
          <Link to="/privacy" className="transition-colors hover:text-slate-600">Privacy</Link>
          <Link to="/contact" className="transition-colors hover:text-slate-600">Help</Link>
        </div>
      </div>
    </footer>
  );
}
