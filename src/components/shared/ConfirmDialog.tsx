import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-sm rounded-md border border-slate-200 bg-white p-5 shadow-lg"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? 'confirm-desc' : undefined}
        style={{ animation: 'ql-enter 150ms ease-out both' }}
      >
        <div className="flex items-start gap-3">
          {variant === 'danger' && (
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50">
              <AlertTriangle size={16} className="text-red-500" />
            </div>
          )}
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-[14px] font-semibold text-slate-900">
              {title}
            </h2>
            {description && (
              <p id="confirm-desc" className="mt-1 text-[13px] leading-5 text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            className="ql-btn-secondary text-[13px]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={variant === 'danger' ? 'ql-btn-danger text-[13px] px-3.5 py-2' : 'ql-btn-primary text-[13px]'}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
