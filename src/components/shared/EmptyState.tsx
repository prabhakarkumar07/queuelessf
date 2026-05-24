import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="ql-empty">
      <Icon size={32} className="text-slate-300" strokeWidth={1.5} />
      <p className="mt-3 text-[14px] font-semibold text-slate-700">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] leading-5 text-slate-500">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="ql-btn-primary mt-4 text-[13px]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
