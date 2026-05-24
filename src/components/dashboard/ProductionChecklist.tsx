import React from 'react';
import { 
  CheckCircle2, Circle, ArrowRight, 
  Building2, Palette, Users, CreditCard, Clock 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Shop, BusinessAccount } from '../../types';

interface ProductionChecklistProps {
  shop: Shop;
  business: BusinessAccount | null;
  servicesCount: number;
  staffCount: number;
}

export const ProductionChecklist: React.FC<ProductionChecklistProps> = ({ 
  shop, business, servicesCount, staffCount 
}) => {
  const steps = [
    {
      id: 'branding',
      label: 'Upload Shop Logo',
      done: !!shop.logoUrl,
      link: '/dashboard/business',
      icon: Palette,
      desc: 'Logo appears on tokens and public profile.'
    },
    {
      id: 'services',
      label: 'Add Services',
      done: servicesCount > 0,
      link: '/dashboard/services',
      icon: Building2,
      desc: 'At least one service is needed for booking.'
    },
    {
      id: 'staff',
      label: 'Assign Staff',
      done: staffCount > 0,
      link: '/dashboard/staff',
      icon: Users,
      desc: 'Add providers to handle the queue.'
    },
    {
      id: 'hours',
      label: 'Set Business Hours',
      done: shop.openTime !== '09:00' || shop.closeTime !== '18:00', // simple check if changed from default
      link: '/dashboard/holidays',
      icon: Clock,
      desc: 'Ensure customers know when you are open.'
    },
    {
      id: 'payments',
      label: 'Configure Payments',
      done: !!business?.razorpayKeyId,
      link: '/dashboard/business',
      icon: CreditCard,
      desc: 'Accept online payments for appointments.'
    },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  if (progress === 100) return null; // Hide if fully ready

  return (
    <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden shadow-sm ring-1 ring-indigo-50">
      <div className="p-4 bg-gradient-to-br from-indigo-50 to-white border-b border-indigo-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">Production Readiness</h3>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {progress}% Complete
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      <div className="p-3 space-y-1">
        {steps.map((step) => (
          <Link
            key={step.id}
            to={step.link}
            className={`group flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
              step.done ? 'hover:bg-slate-50' : 'hover:bg-indigo-50'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 text-slate-300 group-hover:text-indigo-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className={`text-[13px] font-semibold leading-none ${step.done ? 'text-slate-500' : 'text-slate-800'}`}>
                {step.label}
              </p>
              {!step.done && (
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {step.desc}
                </p>
              )}
            </div>
            {!step.done && (
              <ArrowRight className="h-3 w-3 text-slate-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </Link>
        ))}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
        Complete all steps to go live with confidence.
      </div>
    </div>
  );
};
