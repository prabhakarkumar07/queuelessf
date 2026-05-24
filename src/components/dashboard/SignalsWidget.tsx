import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { shopStatusApi } from '../../lib/api';
import type { Analytics } from '../../types';
import { Activity, AlertCircle } from 'lucide-react';

export function SignalsWidget({ shopId }: { shopId: string }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    shopStatusApi
      .getAnalytics(shopId, 7)
      .then(({ data }) => {
        if (mounted) setAnalytics(data);
      })
      .catch(() => {
        if (mounted) toast.error('Failed to load analytics');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [shopId]);

  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <Activity size={16} className="text-slate-400" />
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">7-day signals</h3>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4 px-4 py-5">
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-8 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full animate-pulse" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mb-3" />
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between py-1">
                <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-6 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : analytics ? (
        <div className="space-y-5 px-4 py-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>No-show rate</span>
              <span>{(analytics.noShowRate * 100).toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(analytics.noShowRate * 100, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Popular services</p>
            {analytics.servicePopularity.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No service usage yet.</p>
            ) : (
              <div className="space-y-2.5">
                {analytics.servicePopularity.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[13px]">
                    <span className="truncate text-slate-600 font-medium">{item.service}</span>
                    <span className="ml-3 font-semibold text-slate-900">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-4 py-8 flex flex-col items-center justify-center text-center text-slate-500">
          <AlertCircle size={24} className="text-slate-300 mb-2" strokeWidth={1.5} />
          <p className="text-[13px] font-medium">Failed to load signals</p>
        </div>
      )}
    </section>
  );
}
