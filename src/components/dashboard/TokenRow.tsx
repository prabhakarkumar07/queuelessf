import { useState, useRef, useEffect } from 'react';
import type { Token, TokenPriority } from '../../types';
import { Play, SkipForward, ChevronDown, Clock, Phone, Briefcase, AlertTriangle, UserCheck } from 'lucide-react';

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const PRIORITY_LABELS: Record<TokenPriority, string> = {
  NORMAL: 'Normal',
  SENIOR: 'Senior',
  PREGNANT: 'Pregnant',
  VIP: 'VIP',
  EMERGENCY: 'Emergency',
};

const PRIORITY_STYLES: Record<TokenPriority, string> = {
  NORMAL: 'border-slate-200 bg-slate-50 text-slate-600',
  SENIOR: 'border-blue-200 bg-blue-50 text-blue-700',
  PREGNANT: 'border-pink-200 bg-pink-50 text-pink-700',
  VIP: 'border-amber-200 bg-amber-50 text-amber-800',
  EMERGENCY: 'border-red-200 bg-red-50 text-red-700',
};

const STATUS_STYLES: Record<string, string> = {
  WAITING: 'border-blue-200 bg-blue-50 text-blue-700',
  CALLED: 'border-amber-300 bg-amber-50 text-amber-800',
  ARRIVED: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  SERVING: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export function TokenRow({
  token,
  onSkip,
  onSnooze,
  onServing,
  onArrived,
  onSetPriority,
  onTransfer,
  onCancel,
  onReasonedSkip,
}: {
  token: Token;
  onSkip: (id: string) => void;
  onSnooze: (id: string) => void;
  onServing: (id: string) => void;
  onArrived: (id: string) => void;
  onSetPriority: (id: string, priority: TokenPriority) => void;
  onTransfer?: (token: Token) => void;
  onCancel?: (token: Token) => void;
  onReasonedSkip?: (token: Token) => void;
}) {
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const priorities: TokenPriority[] = ['NORMAL', 'SENIOR', 'PREGNANT', 'VIP', 'EMERGENCY'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPriorityMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={cx(
        'group grid grid-cols-[64px_1fr] gap-3 px-3 py-2 transition-colors duration-150 sm:grid-cols-[64px_minmax(120px,1.5fr)_100px_90px_minmax(150px,auto)] sm:items-center sm:px-4',
        'border-b border-slate-100 last:border-b-0 hover:bg-slate-50',
        token.status === 'CALLED' && 'bg-amber-50/50 hover:bg-amber-50/80',
        token.status === 'ARRIVED' && 'bg-cyan-50/50 hover:bg-cyan-50/80',
        token.status === 'SERVING' && 'bg-emerald-50/50 hover:bg-emerald-50/80',
        token.priority === 'EMERGENCY' && 'bg-red-50/40 hover:bg-red-50/60'
      )}
    >
      <div
        className={cx(
          'flex h-10 w-12 items-center justify-center rounded-md border text-base font-bold tracking-tight shadow-sm sm:w-14 transition-colors',
          token.status === 'CALLED'
            ? 'border-amber-300 bg-amber-400 text-slate-900'
            : token.status === 'ARRIVED'
              ? 'border-cyan-300 bg-cyan-600 text-white'
            : token.status === 'SERVING'
              ? 'border-emerald-300 bg-emerald-600 text-white'
              : token.priority === 'EMERGENCY'
                ? 'border-red-300 bg-red-600 text-white'
                : 'border-slate-200 bg-white text-slate-900'
        )}
      >
        {token.displayNumber}
      </div>

      <div className="min-w-0 overflow-hidden pr-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <p className="truncate text-[13px] font-bold text-slate-900">{token.userName || 'Walk-in customer'}</p>
          {token.priority !== 'NORMAL' && (
            <span className={cx('flex-shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', PRIORITY_STYLES[token.priority])}>
              {PRIORITY_LABELS[token.priority]}
            </span>
          )}
          {token.noShowProbability != null && token.noShowProbability >= 0.85 && (
            <span className="flex-shrink-0 flex items-center gap-0.5 rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-700" title={`High no-show probability: ${Math.round(token.noShowProbability * 100)}%`}>
              <AlertTriangle size={9} /> Risk
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1 truncate">
            <Phone size={10} className="text-slate-400" />
            {token.userPhone || 'No phone'}
          </span>
          {token.serviceName && (
            <span className="flex items-center gap-1 truncate border-l border-slate-200 pl-3">
              <Briefcase size={10} className="text-slate-400" />
              {token.serviceName}
            </span>
          )}
          {token.snoozeCount != null && token.snoozeCount > 0 && (
            <span className="flex items-center gap-1 truncate border-l border-slate-200 pl-3 font-semibold text-amber-600">
              <Clock size={10} />
              Snoozed x{token.snoozeCount}
            </span>
          )}
        </div>
      </div>

      <div className="hidden sm:block">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Clock size={11} /> Wait time
        </div>
        <p className="mt-0.5 text-[13px] font-bold text-slate-700">
          {token.estimatedWaitMins != null ? `${token.estimatedWaitMins} min` : 'Pending'}
        </p>
      </div>

      <div className="col-start-2 flex items-center sm:col-start-auto">
        <span className={cx('rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest', STATUS_STYLES[token.status] ?? 'border-slate-200 bg-slate-50 text-slate-600')}>
          {token.status}
        </span>
      </div>

      <div className="col-span-2 flex min-w-0 flex-wrap items-center justify-end gap-2 sm:col-span-1">
        {token.status === 'CALLED' && (
          <button
            onClick={() => onArrived(token.id)}
            className="flex items-center gap-1.5 rounded-md bg-cyan-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-cyan-700 active:scale-[0.98]"
          >
            <UserCheck size={14} /> Arrived
          </button>
        )}
        {(token.status === 'CALLED' || token.status === 'ARRIVED') && (
          <button
            onClick={() => onServing(token.id)}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98]"
          >
            <Play size={14} /> Start
          </button>
        )}
        {(token.status === 'WAITING' || token.status === 'CALLED') && (
          <>
            <button
              onClick={() => onSnooze(token.id)}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
              title="Push back 3 spots"
            >
              <Clock size={14} /> Snooze
            </button>
            <button
              onClick={() => onReasonedSkip ? onReasonedSkip(token) : onSkip(token.id)}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            >
              <SkipForward size={14} /> Skip
            </button>
            {onTransfer ? (
              <button
                onClick={() => onTransfer(token)}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
              >
                Transfer
              </button>
            ) : null}
            {onCancel ? (
              <button
                onClick={() => onCancel(token)}
                className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 shadow-sm transition-all duration-150 hover:bg-red-100 active:scale-[0.98]"
              >
                Cancel
              </button>
            ) : null}
          </>
        )}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowPriorityMenu((value) => !value)}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
          >
            Priority <ChevronDown size={14} className="text-slate-400" />
          </button>
          {showPriorityMenu && (
            <div className="absolute right-0 top-9 z-20 w-36 rounded-md border border-slate-200 bg-white p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100">
              {priorities.map((priority) => (
                <button
                  key={priority}
                  onClick={() => {
                    onSetPriority(token.id, priority);
                    setShowPriorityMenu(false);
                  }}
                  className={cx(
                    'block w-full rounded px-2.5 py-1.5 text-left text-xs font-medium transition-colors',
                    token.priority === priority ? 'bg-slate-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  {PRIORITY_LABELS[priority]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
