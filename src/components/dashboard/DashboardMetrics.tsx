import { cx } from './TokenRow';
import type { LiveQueue, ShopStats } from '../../types';

export function Metric({
  label,
  value,
  helper,
  tone = 'slate',
}: {
  label: string;
  value: string | number;
  helper?: string;
  tone?: 'slate' | 'amber' | 'green' | 'red' | 'blue';
}) {
  const valueColor = {
    slate: 'text-slate-900',
    amber: 'text-amber-600',
    green: 'text-emerald-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
  }[tone];

  return (
    <div className="border-r border-slate-100 px-4 py-3 last:border-r-0 flex flex-col justify-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className={cx('text-2xl font-semibold leading-none tracking-tight', valueColor)}>{value}</p>
        {helper && <p className="text-[11px] font-medium text-slate-500">{helper}</p>}
      </div>
    </div>
  );
}

export function DashboardMetrics({ stats, queue }: { stats: ShopStats | null; queue: LiveQueue | null }) {
  const waitingTokens = queue?.waitingTokens ?? [];
  const highPriorityCount = waitingTokens.filter((token) => token.priority !== 'NORMAL').length;
  const completionRate = stats?.totalTokensToday
    ? Math.round((stats.servedToday / Math.max(stats.totalTokensToday, 1)) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 bg-slate-50/50 md:grid-cols-5 divide-y md:divide-y-0 divide-slate-100">
      <Metric label="Waiting" value={stats?.waitingNow ?? queue?.totalWaiting ?? '-'} helper="now" tone="blue" />
      <Metric
        label="Serving"
        value={queue?.currentTokenDisplay && queue.currentTokenDisplay !== '-' ? queue.currentTokenDisplay : 'None'}
        tone="amber"
      />
      <Metric label="Served" value={stats?.servedToday ?? '-'} helper={`${completionRate}%`} tone="green" />
      <Metric label="Cancelled" value={stats?.cancelledToday ?? '-'} tone="red" />
      <Metric
        label="Avg wait"
        value={stats ? `${Math.round(stats.avgWaitMinutes)}m` : '-'}
        helper={`${highPriorityCount} priority`}
      />
    </div>
  );
}
