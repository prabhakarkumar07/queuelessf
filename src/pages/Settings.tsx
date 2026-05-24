import React, { useEffect, useState } from 'react';
import { 
  Building2, CreditCard, Receipt, Shield, 
  Save, Loader2, Globe, Palette, Megaphone
} from 'lucide-react';
import { businessAccountApi } from '../lib/api';
import { BusinessAccount } from '../types';
import toast from 'react-hot-toast';
import { useDashboard } from '../components/layout/DashboardLayout';
import { Breadcrumbs } from '../components/shared';
import ShopBranding from '../components/dashboard/ShopBranding';

export default function Settings() {
  const { activeShop, setActiveShop } = useDashboard();
  const [business, setBusiness] = useState<BusinessAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'business' | 'branding' | 'payments'>('business');

  useEffect(() => {
    setLoading(true);
    businessAccountApi.getSettings()
      .then(({ data }) => setBusiness(data))
      .catch(() => toast.error('Failed to load business settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateBusiness = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!business) return;
    setSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());
      const { data: updated } = await businessAccountApi.updateSettings(data);
      setBusiness(updated);
      toast.success('Business settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="ql-page max-w-5xl">
      <Breadcrumbs />
      <div className="mb-8">
        <p className="ql-kicker">Configuration</p>
        <h1 className="ql-title">Branch & Business Settings</h1>
        <p className="text-slate-500 mt-1">Manage your branding, tax details, and payment gateways.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('business')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'business' 
                ? 'bg-slate-900 text-white shadow-md shadow-slate-200' 
                : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Business Info
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'branding' 
                ? 'bg-slate-900 text-white shadow-md shadow-slate-200' 
                : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Palette className="h-4 w-4" />
              Branding & SEO
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'payments' 
                ? 'bg-slate-900 text-white shadow-md shadow-slate-200' 
                : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Payments & Payouts
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'business' && business && (
            <form onSubmit={handleUpdateBusiness} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-semibold text-slate-800">Tax & Billing Details</h3>
                  </div>
                </div>
                <div className="p-6 grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Registered Name</label>
                      <input 
                        name="name"
                        defaultValue={business.name}
                        className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Billing Email</label>
                      <input 
                        name="billingEmail"
                        type="email"
                        defaultValue={business.billingEmail}
                        className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="invoices@business.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">GSTIN (Optional)</label>
                      <input 
                        name="gstin"
                        defaultValue={business.gstin}
                        className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="07AAAAA0000A1Z5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Tax Percentage</label>
                      <div className="relative">
                        <input 
                          name="taxPercent"
                          type="number"
                          step="0.01"
                          defaultValue={business.taxPercent}
                          className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 pr-8"
                        />
                        <span className="absolute right-3 top-2 text-slate-400 text-sm">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Invoice Prefix</label>
                      <input 
                        name="invoicePrefix"
                        defaultValue={business.invoicePrefix}
                        className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="QL"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-semibold text-slate-800">Communication Settings</h3>
                  </div>
                </div>
                <div className="p-6 grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">SMS Sender ID</label>
                      <input 
                        name="smsSenderId"
                        defaultValue={business.smsSenderId}
                        className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="QUELES"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp Business Number</label>
                      <input 
                        name="whatsappNumber"
                        defaultValue={business.whatsappNumber}
                        className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="+919876543210"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Business Settings
                </button>
              </div>
            </form>
          )}

          {activeTab === 'branding' && activeShop && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 mb-6">
                <Globe className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Branch Specific Branding</h4>
                  <p className="text-xs text-blue-800 mt-1">
                    Branding and SEO settings are specific to each branch. Currently editing for <strong>{activeShop.name}</strong>.
                  </p>
                </div>
              </div>
              <ShopBranding shop={activeShop} onUpdate={(updated) => setActiveShop(updated)} />
            </div>
          )}

          {activeTab === 'payments' && business && (
            <form onSubmit={handleUpdateBusiness} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-semibold text-slate-800">Razorpay Configuration</h3>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      To accept online payments for bookings, provide your Razorpay API keys. 
                      You can find these in your Razorpay Dashboard under <strong>Settings {'>'} API Keys</strong>.
                    </p>
                  </div>
                  <div className="grid gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Key ID</label>
                      <input 
                        name="razorpayKeyId"
                        defaultValue={business.razorpayKeyId}
                        className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                        placeholder="rzp_live_..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Key Secret</label>
                      <input 
                        name="razorpayKeySecret"
                        type="password"
                        placeholder="••••••••••••••••"
                        className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-semibold text-slate-800">Payout Details</h3>
                  </div>
                </div>
                <div className="p-6 grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Holder Name</label>
                      <input 
                        name="payoutAccountName"
                        defaultValue={business.payoutAccountName}
                        className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Full name as per bank"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank Account Number</label>
                      <input 
                        name="payoutAccountNumber"
                        className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={business.payoutAccountNumberMasked || "Account number"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">IFSC Code</label>
                      <input 
                        name="payoutIfsc"
                        defaultValue={business.payoutIfsc}
                        className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="HDFC0001234"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Settlement Frequency</label>
                      <select 
                        name="settlementFrequency"
                        defaultValue={business.settlementFrequency}
                        className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Payment Settings
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
