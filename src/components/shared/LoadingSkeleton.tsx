interface LoadingSkeletonProps {
  variant?: 'cards' | 'table' | 'list' | 'form' | 'chart';
  count?: number;
}

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className}`} />;
}

function CardsSkeleton({ count = 3 }: { count: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <Pulse className="mb-3 h-4 w-24" />
          <Pulse className="mb-2 h-3 w-full" />
          <Pulse className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ count = 5 }: { count: number }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <Pulse className="h-3 w-32" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Pulse className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-3 w-48" />
              <Pulse className="h-2.5 w-64 max-w-full" />
            </div>
            <Pulse className="h-7 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ListSkeleton({ count = 4 }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
          <Pulse className="h-10 w-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Pulse className="h-3 w-40" />
            <Pulse className="h-2.5 w-56" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <Pulse className="mb-6 h-5 w-40" />
      <div className="space-y-5">
        <div>
          <Pulse className="mb-2 h-3 w-20" />
          <Pulse className="h-9 w-full rounded-md" />
        </div>
        <div>
          <Pulse className="mb-2 h-3 w-24" />
          <Pulse className="h-9 w-full rounded-md" />
        </div>
        <div>
          <Pulse className="mb-2 h-3 w-16" />
          <Pulse className="h-20 w-full rounded-md" />
        </div>
        <Pulse className="h-9 w-28 rounded-md" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <Pulse className="mb-4 h-4 w-32" />
      <Pulse className="h-48 w-full rounded-md" />
    </div>
  );
}

export function LoadingSkeleton({ variant = 'list', count = 4 }: LoadingSkeletonProps) {
  switch (variant) {
    case 'cards':
      return <CardsSkeleton count={count} />;
    case 'table':
      return <TableSkeleton count={count} />;
    case 'form':
      return <FormSkeleton />;
    case 'chart':
      return <ChartSkeleton />;
    case 'list':
    default:
      return <ListSkeleton count={count} />;
  }
}
