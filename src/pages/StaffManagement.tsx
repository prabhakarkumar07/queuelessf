import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDashboard } from '../components/layout/DashboardLayout';
import { Breadcrumbs } from '../components/shared';
import { providerApi } from '../lib/api';
import type { ServiceProvider } from '../types';

export default function StaffManagement() {
  const { activeShop } = useDashboard();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', title: '', staffRole: 'PROVIDER' });

  const loadProviders = useCallback(async () => {
    if (!activeShop) return;
    setLoading(true);
    try {
      const { data } = await providerApi.getByShop(activeShop.id);
      setProviders(data);
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, [activeShop]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const handleAddStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeShop) return;

    try {
      await providerApi.create(activeShop.id, formData);
      toast.success('Staff member added');
      setIsAdding(false);
      setFormData({ name: '', phone: '', password: '', title: '', staffRole: 'PROVIDER' });
      loadProviders();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to add staff');
    }
  };

  const handleDelete = async (providerId: string) => {
    if (!activeShop) return;
    if (!confirm('Remove this staff member from the branch?')) return;

    try {
      await providerApi.delete(activeShop.id, providerId);
      toast.success('Staff member removed');
      loadProviders();
    } catch {
      toast.error('Failed to remove staff member');
    }
  };

  const handleAvailabilityToggle = async (provider: ServiceProvider) => {
    if (!activeShop) return;
    try {
      setBusyId(provider.id);
      const { data } = await providerApi.updateAvailability(activeShop.id, provider.id, !provider.available);
      setProviders((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      toast.success(data.available ? `${data.name} is available` : `${data.name} is unavailable`);
    } catch {
      toast.error('Failed to update availability');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="ql-page">
      <Breadcrumbs />
      <div className="ql-header">
        <div>
          <p className="ql-kicker">Branch staffing</p>
          <h1 className="ql-title">Staff</h1>
          <p className="ql-subtitle">Manage counter operators and availability. Keep this accurate before rush hours.</p>
        </div>
        <button onClick={() => setIsAdding((value) => !value)} className="ql-btn-primary">
          {isAdding ? 'Close form' : 'Add staff'}
        </button>
      </div>

      {!activeShop ? (
        <div className="ql-empty">No shop selected.</div>
      ) : (
        <section className="ql-panel">
          <div className="ql-panel-head">
            <h2 className="text-sm font-black text-stone-950">{activeShop.name}</h2>
            <p className="mt-0.5 text-xs text-stone-500">{providers.length} staff profiles connected</p>
          </div>

          {isAdding ? (
            <form onSubmit={handleAddStaff} className="grid gap-3 border-b border-stone-200 bg-stone-50/60 p-4 sm:grid-cols-2">
              <div>
                <label className="ql-label">Name</label>
                <input required className="ql-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="ql-label">Role title</label>
                <input required className="ql-field" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label className="ql-label">System Access Level</label>
                <select className="ql-field" value={formData.staffRole} onChange={(e) => setFormData({ ...formData, staffRole: e.target.value })}>
                  <option value="RECEPTIONIST">Receptionist (Manage Queue)</option>
                  <option value="PROVIDER">Provider (Manage Own Queue)</option>
                  <option value="MANAGER">Manager (Full Access)</option>
                </select>
              </div>
              <div>
                <label className="ql-label">Phone</label>
                <input
                  required
                  type="tel"
                  pattern="[6-9][0-9]{9}"
                  placeholder="10 digit number"
                  className="ql-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                />
              </div>
              <div>
                <label className="ql-label">Temporary password</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  className="ql-field"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <button type="submit" className="ql-btn-primary">Save staff member</button>
                <button type="button" onClick={() => setIsAdding(false)} className="ql-btn-secondary">Cancel</button>
              </div>
            </form>
          ) : null}

          {loading ? (
            <div className="flex h-44 items-center justify-center">
              <div className="ql-spinner" />
            </div>
          ) : providers.length === 0 ? (
            <div className="ql-empty m-4">
              <div>
                <p className="font-bold text-stone-950">No staff members yet</p>
                <p className="mt-1">Add operators before assigning service counters.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {providers.map((provider) => (
                <div key={provider.id} className="ql-row flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-950 text-xs font-black text-white">
                      {provider.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-stone-950">{provider.name}</p>
                      <p className="truncate text-xs text-stone-500">
                        {provider.title} ({provider.staffRole?.toLowerCase() || 'provider'}) · {provider.phone}
                      </p>
                      {provider.serviceNames?.length ? (
                        <p className="mt-1 truncate text-xs text-stone-500">{provider.serviceNames.join(' · ')}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className={`ql-chip ${provider.available ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                      {provider.available ? 'Available' : 'Unavailable'}
                    </span>
                    <button
                      onClick={() => handleAvailabilityToggle(provider)}
                      disabled={busyId === provider.id}
                      className="ql-btn-secondary py-1.5 text-xs"
                    >
                      {provider.available ? 'Set unavailable' : 'Set available'}
                    </button>
                    <button onClick={() => handleDelete(provider.id)} className="ql-btn-danger">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
