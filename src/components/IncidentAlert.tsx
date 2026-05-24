import React from 'react';
import { AlertTriangle, XCircle, Clock } from 'lucide-react';
import { Shop } from '../types';

interface IncidentAlertProps {
  shop: Shop;
}

export const IncidentAlert: React.FC<IncidentAlertProps> = ({ shop }) => {
  if (!shop.incidentStatus || shop.incidentStatus === 'NORMAL') return null;

  const configMap = {
    DELAYED: {
      icon: Clock,
      color: 'text-amber-800',
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      label: 'Service Delay Notice',
    },
    EMERGENCY_CLOSURE: {
      icon: XCircle,
      color: 'text-red-800',
      border: 'border-red-200',
      bg: 'bg-red-50',
      label: 'Emergency Closure',
    },
    SYSTEM_DOWN: {
      icon: AlertTriangle,
      color: 'text-slate-800',
      border: 'border-slate-200',
      bg: 'bg-slate-50',
      label: 'Temporary Technical Issues',
    },
  };

  const config = configMap[shop.incidentStatus as keyof typeof configMap];

  if (!config) return null;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4 mb-6 shadow-sm animate-pulse`}>
      <div className="flex gap-3">
        <config.icon className={`h-5 w-5 ${config.color} shrink-0 mt-0.5`} />
        <div>
          <h4 className={`text-sm font-bold ${config.color} uppercase tracking-wider`}>
            {config.label}
          </h4>
          <p className={`mt-1 text-sm ${config.color} font-medium leading-relaxed`}>
            {shop.incidentMessage || "We're currently experiencing some operational challenges. Please contact us for more details."}
          </p>
        </div>
      </div>
    </div>
  );
};
