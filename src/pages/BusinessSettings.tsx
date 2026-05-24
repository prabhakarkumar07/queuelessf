import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Building2, CreditCard, FileText, Landmark, MessageSquare, Plus, Save } from 'lucide-react';
import { businessAccountApi } from '../lib/api';
import type { BusinessAccount } from '../types';

interface BusinessForm {
  name: string;
  billingEmail: string;
  gstin: string;
  taxPercent: number;
  invoicePrefix: string;
  razorpayKeyId: string;
  stripePublishableKey: string;
  payoutAccountName: string;
  payoutAccountNumberMasked: string;
  payoutIfsc: string;
  smsSenderId: string;
  whatsappNumber: string;
}

const EMPTY_FORM: BusinessForm = {
  name: '',
  billingEmail: '',
  gstin: '',
  taxPercent: 18,
  invoicePrefix: 'QL',
  razorpayKeyId: '',
  stripePublishableKey: '',
  payoutAccountName: '',
  payoutAccountNumberMasked: '',
  payoutIfsc: '',
  smsSenderId: '',
  whatsappNumber: '',
};

function toForm(account?: BusinessAccount | null): BusinessForm {
  if (!account) return EMPTY_FORM;
  return {
    name: account.name ?? '',
    billingEmail: account.billingEmail ?? '',
    gstin: account.gstin ?? '',
    taxPercent: account.taxPercent ?? 18,
    invoicePrefix: account.invoicePrefix ?? 'QL',
    razorpayKeyId: account.razorpayKeyId ?? '',
    stripePublishableKey: account.stripePublishableKey ?? '',
    payoutAccountName: account.payoutAccountName ?? '',
    payoutAccountNumberMasked: account.payoutAccountNumberMasked ?? '',
    payoutIfsc: account.payoutIfsc ?? '',
    smsSenderId: account.smsSenderId ?? '',
    whatsappNumber: account.whatsappNumber ?? '',
  };
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="ql-panel">
      <div className="ql-panel-head flex items-center gap-2">
        <Icon size={16} className="text-slate-400" />
        <h2 className="text-sm font-black text-slate-950">{title}</h2>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

export default function BusinessSettings() {
  const [accounts, setAccounts] = useState<BusinessAccount[]>([]);
  const [activeId, setActiveId] = useState('');
  const [form, setForm] = useState<BusinessForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    businessAccountApi
      .getMine()
      .then(({ data }) => {
        const list = data as BusinessAccount[];
        setAccounts(list);
        const first = list[0] ?? null;
        setActiveId(first?.id ?? '');
        setForm(toForm(first));
      })
      .catch(() => toast.error('Failed to load business settings'))
      .finally(() => setLoading(false));
  }, []);

  const activeAccount = accounts.find((account) => account.id === activeId) ?? null;

  const selectAccount = (accountId: string) => {
    const account = accounts.find((item) => item.id === accountId) ?? null;
    setActiveId(accountId);
    setForm(toForm(account));
  };

  const update = <K extends keyof BusinessForm>(key: K, value: BusinessForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Business name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        billingEmail: form.billingEmail.trim() || undefined,
        gstin: form.gstin.trim() || undefined,
        invoicePrefix: form.invoicePrefix.trim() || 'QL',
        razorpayKeyId: form.razorpayKeyId.trim() || undefined,
        stripePublishableKey: form.stripePublishableKey.trim() || undefined,
        payoutAccountName: form.payoutAccountName.trim() || undefined,
        payoutAccountNumberMasked: form.payoutAccountNumberMasked.trim() || undefined,
        payoutIfsc: form.payoutIfsc.trim() || undefined,
        smsSenderId: form.smsSenderId.trim() || undefined,
        whatsappNumber: form.whatsappNumber.trim() || undefined,
      };
      const { data } = activeAccount
        ? await businessAccountApi.update(activeAccount.id, payload)
        : await businessAccountApi.create(payload);
      const saved = data as BusinessAccount;
      setAccounts((prev) => activeAccount ? prev.map((item) => item.id === saved.id ? saved : item) : [...prev, saved]);
      setActiveId(saved.id);
      setForm(toForm(saved));
      toast.success('Business settings saved');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save business settings';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="ql-page"><div className="ql-panel flex h-64 items-center justify-center"><div className="ql-spinner" /></div></div>;
  }

  return (
    <div className="ql-page">
      <div className="ql-header">
        <div>
          <p className="ql-kicker">Production setup</p>
          <h1 className="ql-title">Business settings</h1>
          <p className="ql-subtitle">Configure billing identity, payment gateway references, payout details, and customer notification sender settings.</p>
        </div>
        <button
          type="button"
          className="ql-btn-secondary"
          onClick={() => {
            setActiveId('');
            setForm(EMPTY_FORM);
          }}
        >
          <Plus size={15} /> New account
        </button>
      </div>

      {accounts.length ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {accounts.map((account) => (
            <button
              key={account.id}
              className={activeId === account.id ? 'ql-btn-primary py-1.5 text-xs' : 'ql-btn-secondary py-1.5 text-xs'}
              onClick={() => selectAccount(account.id)}
            >
              {account.name}
            </button>
          ))}
        </div>
      ) : null}

      <form onSubmit={save} className="space-y-4">
        <Section icon={Building2} title="Business identity">
          <div>
            <label className="ql-label">Business name</label>
            <input required className="ql-field" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="City Care Clinics Pvt Ltd" />
          </div>
          <div>
            <label className="ql-label">Billing email</label>
            <input type="email" className="ql-field" value={form.billingEmail} onChange={(event) => update('billingEmail', event.target.value)} placeholder="billing@example.com" />
          </div>
        </Section>

        <Section icon={FileText} title="GST and invoices">
          <div>
            <label className="ql-label">GSTIN / tax ID</label>
            <input className="ql-field uppercase" value={form.gstin} onChange={(event) => update('gstin', event.target.value.toUpperCase())} placeholder="29ABCDE1234F1Z5" />
          </div>
          <div>
            <label className="ql-label">Invoice prefix</label>
            <input className="ql-field uppercase" value={form.invoicePrefix} onChange={(event) => update('invoicePrefix', event.target.value.toUpperCase().slice(0, 20))} placeholder="QL" />
          </div>
          <div>
            <label className="ql-label">Default tax percent</label>
            <input type="number" min={0} max={100} step={0.01} className="ql-field" value={form.taxPercent} onChange={(event) => update('taxPercent', Number(event.target.value))} />
          </div>
        </Section>

        <Section icon={CreditCard} title="Payment gateway">
          <div>
            <label className="ql-label">Razorpay key ID</label>
            <input className="ql-field" value={form.razorpayKeyId} onChange={(event) => update('razorpayKeyId', event.target.value)} placeholder="rzp_live_xxxxx" />
          </div>
          <div>
            <label className="ql-label">Stripe publishable key</label>
            <input className="ql-field" value={form.stripePublishableKey} onChange={(event) => update('stripePublishableKey', event.target.value)} placeholder="pk_live_xxxxx" />
          </div>
        </Section>

        <Section icon={Landmark} title="Payout details">
          <div>
            <label className="ql-label">Account holder name</label>
            <input className="ql-field" value={form.payoutAccountName} onChange={(event) => update('payoutAccountName', event.target.value)} />
          </div>
          <div>
            <label className="ql-label">Masked account number</label>
            <input className="ql-field" value={form.payoutAccountNumberMasked} onChange={(event) => update('payoutAccountNumberMasked', event.target.value)} placeholder="XXXXXX1234" />
          </div>
          <div>
            <label className="ql-label">IFSC / routing code</label>
            <input className="ql-field uppercase" value={form.payoutIfsc} onChange={(event) => update('payoutIfsc', event.target.value.toUpperCase())} />
          </div>
        </Section>

        <Section icon={MessageSquare} title="Notification senders">
          <div>
            <label className="ql-label">SMS sender ID</label>
            <input className="ql-field uppercase" value={form.smsSenderId} onChange={(event) => update('smsSenderId', event.target.value.toUpperCase().slice(0, 20))} placeholder="QUEUE" />
          </div>
          <div>
            <label className="ql-label">WhatsApp business number</label>
            <input className="ql-field" value={form.whatsappNumber} onChange={(event) => update('whatsappNumber', event.target.value.replace(/[^\d+]/g, '').slice(0, 20))} placeholder="+919999999999" />
          </div>
        </Section>

        <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex justify-end">
            <button className="ql-btn-primary" disabled={saving}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save business settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
