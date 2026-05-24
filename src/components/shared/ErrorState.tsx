import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-red-50">
        <AlertTriangle size={20} className="text-red-500" />
      </div>
      <p className="mt-4 text-[14px] font-semibold text-slate-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ql-btn-secondary mt-4 gap-2 text-[13px]"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
