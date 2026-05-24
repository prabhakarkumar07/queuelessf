import { useEffect, useState } from 'react';
import { useDashboard } from '../components/layout/DashboardLayout';
import { subscriptionApi } from '../lib/api';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubscriptionData {
  plan: string;
  status: string;
  nextBillingDate?: string;
  features?: string[];
}

import { CheckCircle2, Sparkles, Zap, Shield, Crown } from 'lucide-react';

const PLANS = [
  { 
    id: 'FREE', 
    name: 'Free', 
    price: '₹0', 
    description: 'Perfect for small shops just starting out.',
    features: [
      { name: 'Up to 100 tokens/month', included: true },
      { name: '1 Branch limit', included: true },
      { name: '2 Staff members', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'Custom Branding', included: false },
      { name: 'WhatsApp Notifications', included: false },
    ],
    color: 'slate',
    icon: Shield
  },
  { 
    id: 'STARTER', 
    name: 'Starter', 
    price: '₹499', 
    description: 'For growing businesses needing more capacity.',
    features: [
      { name: 'Up to 500 tokens/month', included: true },
      { name: '3 Branch limit', included: true },
      { name: '5 Staff members', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'Custom Branding', included: false },
      { name: 'WhatsApp Notifications', included: false },
    ],
    color: 'blue',
    icon: Zap
  },
  { 
    id: 'PRO', 
    name: 'Pro', 
    price: '₹3999', 
    description: 'Unlimited everything for serious enterprises.',
    popular: true,
    features: [
      { name: 'Unlimited tokens', included: true },
      { name: 'Unlimited Branches', included: true },
      { name: 'Unlimited Staff', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Custom Branding', included: true },
      { name: 'WhatsApp Notifications', included: true },
    ],
    color: 'indigo',
    icon: Crown
  },
];

export default function Subscription() {
  const { activeShop } = useDashboard();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!activeShop?.id) return;
    setLoading(true);
    setError(false);
    
    subscriptionApi.getCurrent(activeShop.id)
      .then((res) => setSubscription(res.data))
      .catch(() => {
        setError(true);
        setSubscription({ plan: 'FREE', status: 'ACTIVE' });
      })
      .finally(() => setLoading(false));
  }, [activeShop?.id]);

  const handleChangePlan = async (newPlanId: string) => {
    if (!activeShop?.id) return;
    
    setChanging(true);
    try {
      const { data } = await subscriptionApi.update(activeShop.id, newPlanId);
      
      if (data.providerSubscriptionId && window.Razorpay) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
          subscription_id: data.providerSubscriptionId,
          name: "QueueLess",
          description: `Subscription to ${newPlanId} plan`,
          handler: function (_response: any) {
            toast.success(`Successfully subscribed to ${newPlanId}!`);
            setSubscription((prev) => prev ? { ...prev, plan: newPlanId, status: 'ACTIVE' } : null);
          },
          theme: { color: "#4f46e5" }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any){
          toast.error(response.error.description || "Payment failed.");
        });
        rzp.open();
      } else {
        setSubscription((prev) => prev ? { ...prev, plan: newPlanId } : null);
        toast.success(`Successfully changed plan to ${newPlanId}`);
      }
    } catch (err) {
      toast.error('Failed to initiate subscription checkout.');
    } finally {
      setChanging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Unlock the full potential of your business with QueueLess. No hidden fees, cancel anytime.
        </p>
      </div>

      {error && (
        <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 shadow-sm">
          <p className="text-sm font-bold flex items-center gap-2">
            <Shield className="h-4 w-4" /> Billing system unavailable
          </p>
          <p className="text-xs mt-1 ml-6">Displaying fallback plan details. Changes may not be saved.</p>
        </div>
      )}

      {/* Current Plan Banner */}
      <div className="mx-auto mb-12 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-8 ring-indigo-50/50">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Plan</p>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="text-3xl font-black text-slate-900">{subscription?.plan || 'Free'}</h2>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  {subscription?.status || 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-0">
            {subscription?.plan !== 'PRO' && (
              <button 
                onClick={() => handleChangePlan('PRO')}
                disabled={changing}
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                <span className="relative z-10">Upgrade to Pro</span>
                <Crown className="relative z-10 h-4 w-4 text-amber-400" />
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:animate-shimmer"></div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-3 lg:gap-12 items-start">
        {PLANS.map((plan) => {
          const isCurrent = subscription?.plan === plan.id;
          const isPopular = plan.popular;
          const Icon = plan.icon;
          
          return (
            <div 
              key={plan.id} 
              className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 ${
                isCurrent 
                  ? 'border-2 border-indigo-500 bg-white shadow-xl shadow-indigo-100 scale-105 z-10' 
                  : isPopular
                    ? 'border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 shadow-lg'
                    : 'border border-slate-200 bg-white shadow-sm hover:shadow-md'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-4 py-1 text-xs font-bold tracking-wide text-white shadow-sm">
                  YOUR CURRENT PLAN
                </div>
              )}
              {!isCurrent && isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1 text-xs font-bold tracking-wide text-white shadow-sm">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6 flex items-center justify-between">
                <h4 className="text-xl font-bold text-slate-900">{plan.name}</h4>
                <Icon className={`h-6 w-6 ${isCurrent ? 'text-indigo-500' : 'text-slate-400'}`} />
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight text-slate-900">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-sm font-semibold text-slate-500">/mo</span>}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{plan.description}</p>
              </div>

              <button
                onClick={() => handleChangePlan(plan.id)}
                disabled={isCurrent || changing}
                className={`mb-8 w-full rounded-xl py-3 text-sm font-bold transition-all ${
                  isCurrent
                    ? 'bg-indigo-50 text-indigo-400 cursor-not-allowed border border-indigo-100'
                    : isPopular
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                      : 'bg-white text-slate-900 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:ring-slate-300'
                }`}
              >
                {isCurrent ? 'Current Plan' : `Get ${plan.name}`}
              </button>

              <div className="flex-1">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-900">Features included</p>
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      {feature.included ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                      ) : (
                        <div className="h-5 w-5 shrink-0 flex items-center justify-center">
                          <div className="h-0.5 w-3 bg-slate-300 rounded-full" />
                        </div>
                      )}
                      <span className={feature.included ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
