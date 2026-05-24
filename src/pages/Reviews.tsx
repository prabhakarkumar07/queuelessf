import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useDashboard } from '../components/layout/DashboardLayout';
import { Breadcrumbs } from '../components/shared';
import { reviewApi } from '../lib/api';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  userName: string;
  visible?: boolean;
  moderationStatus?: string;
  moderationReason?: string;
  createdAt: string;
}

interface ReviewSummary {
  avgRating: number;
  totalReviews: number;
  breakdown: Record<string, number>;
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((item) => (
        <svg key={item} width={size} height={size} viewBox="0 0 24 24" fill={item <= rating ? '#d97706' : '#d6d3d1'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export default function Reviews() {
  const { activeShop } = useDashboard();
  const activeShopId = activeShop?.id ?? '';
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeShopId) return;
    setLoading(true);
    Promise.all([reviewApi.getOwnerByShop(activeShopId), reviewApi.getOwnerSummary(activeShopId)])
      .then(([reviewsRes, summaryRes]) => {
        setReviews(reviewsRes.data.content ?? reviewsRes.data);
        setSummary(summaryRes.data);
      })
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, [activeShopId]);

  return (
    <div className="ql-page">
      <Breadcrumbs />
      <div className="ql-header">
        <div>
          <p className="ql-kicker">Customer feedback</p>
          <h1 className="ql-title">Reviews</h1>
          <p className="ql-subtitle">A compact view of recent feedback and rating distribution for the selected branch.</p>
        </div>
      </div>

      {summary ? (
        <section className="ql-panel mb-4">
          <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
            <div className="border-b border-stone-200 p-4 sm:border-b-0 sm:border-r">
              <p className="ql-kicker">Average rating</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-black tracking-tight text-amber-700">{summary.avgRating.toFixed(1)}</span>
                <span className="mb-1 text-sm font-semibold text-stone-500">/ 5</span>
              </div>
              <div className="mt-2"><StarRating rating={Math.round(summary.avgRating)} size={17} /></div>
              <p className="mt-2 text-xs text-stone-500">{summary.totalReviews} total reviews</p>
            </div>
            <div className="p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">Rating breakdown</p>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.breakdown?.[star] ?? 0;
                const pct = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="mb-2 grid grid-cols-[24px_1fr_36px] items-center gap-2">
                    <span className="text-right text-xs font-bold text-stone-500">{star}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-right text-xs font-semibold text-stone-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="ql-panel">
        {loading ? (
          <div className="flex h-44 items-center justify-center"><div className="ql-spinner" /></div>
        ) : reviews.length === 0 ? (
          <div className="ql-empty m-4">
            <div>
              <p className="font-bold text-stone-950">No reviews yet</p>
              <p className="mt-1">Reviews appear after customers complete a visit.</p>
            </div>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="ql-row flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-950 text-xs font-black text-white">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-950">{review.userName}</p>
                    <p className="text-xs text-stone-500">{format(new Date(review.createdAt), 'dd MMM yyyy')}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className={`ql-chip ${
                    review.visible === false
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}>
                    {review.visible === false ? 'Hidden' : 'Public'}
                  </span>
                  {review.moderationStatus ? (
                    <span className="ql-chip">{review.moderationStatus}</span>
                  ) : null}
                </div>
                {review.comment ? <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{review.comment}</p> : null}
                {review.moderationReason ? <p className="mt-2 text-xs font-semibold text-red-600">{review.moderationReason}</p> : null}
              </div>
              <span className="text-lg font-black text-amber-700">{review.rating}.0</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
