import type { ReactNode } from 'react';

interface PageHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ kicker, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="ql-header">
      <div>
        {kicker && <p className="ql-kicker">{kicker}</p>}
        <h1 className="ql-title">{title}</h1>
        {subtitle && <p className="ql-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
