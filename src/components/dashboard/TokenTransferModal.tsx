import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { providerApi, shopApi, tokenApi } from '../../lib/api';
import type { Service, ServiceProvider, Token } from '../../types';

export function TokenTransferModal({
  token,
  shopId,
  onClose,
  onTransferred,
}: {
  token: Token;
  shopId: string;
  onClose: () => void;
  onTransferred: () => void;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    serviceId: token.serviceId ?? '',
    providerId: token.providerId ?? '',
    reason: '',
  });

  useEffect(() => {
    Promise.allSettled([shopApi.getServices(shopId), providerApi.getByShop(shopId)]).then(([servicesRes, providersRes]) => {
      setServices(servicesRes.status === 'fulfilled' ? servicesRes.value.data : []);
      setProviders(providersRes.status === 'fulfilled' ? providersRes.value.data : []);
    });
  }, [shopId]);

  const matchingProviders = providers.filter((provider) => {
    if (!provider.active || !provider.available) return false;
    if (!form.serviceId || !provider.serviceIds?.length) return true;
    return provider.serviceIds.includes(form.serviceId);
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await tokenApi.transfer(token.id, {
        serviceId: form.serviceId || null,
        providerId: form.providerId || null,
        reason: form.reason.trim() || undefined,
      });
      toast.success(`${token.displayNumber} transferred`);
      onTransferred();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Could not transfer token';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="ql-kicker">Transfer token</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{token.displayNumber}</h2>
            <p className="mt-0.5 text-sm font-medium text-slate-500">{token.userName || 'Walk-in customer'}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="ql-label">Target Service</label>
            <select
              className="ql-field"
              value={form.serviceId}
              onChange={(event) => setForm((value) => ({ ...value, serviceId: event.target.value, providerId: '' }))}
            >
              <option value="">General / any service</option>
              {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
          </div>

          <div>
            <label className="ql-label">Target Provider</label>
            <select
              className="ql-field"
              value={form.providerId}
              onChange={(event) => setForm((value) => ({ ...value, providerId: event.target.value }))}
            >
              <option value="">Any available provider</option>
              {matchingProviders.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
            </select>
          </div>

          <div>
            <label className="ql-label">Transfer Reason (Optional)</label>
            <input
              className="ql-field"
              value={form.reason}
              onChange={(event) => setForm((value) => ({ ...value, reason: event.target.value }))}
              placeholder="e.g. Wrong service selected"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button type="button" onClick={onClose} className="ql-btn-secondary flex-1" disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="ql-btn-primary flex-1" disabled={saving}>
            {saving ? 'Transferring...' : 'Confirm Transfer'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
