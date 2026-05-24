import { useEffect, useState, useCallback, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useDashboard } from '../components/layout/DashboardLayout';
import { Breadcrumbs, EmptyState, ErrorState, LoadingSkeleton, ConfirmDialog } from '../components/shared';
import { shopApi } from '../lib/api';
import type { Service } from '../types';

interface ServiceForm {
  name: string;
  description: string;
  durationMins: number;
  price: number;
}

const EMPTY_FORM: ServiceForm = { name: '', description: '', durationMins: 15, price: 0 };

export default function Services() {
  const { activeShop } = useDashboard();
  const activeShopId = activeShop?.id ?? '';
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const loadServices = useCallback(() => {
    if (!activeShopId) return;
    setLoading(true);
    setError(false);
    shopApi
      .getServices(activeShopId)
      .then(({ data }) => setServices(data))
      .catch(() => {
        setError(true);
        toast.error('Failed to load services');
      })
      .finally(() => setLoading(false));
  }, [activeShopId]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeShopId) return;
    setSaving(true);
    try {
      const { data } = await shopApi.addService(activeShopId, form);
      setServices((prev) => [...prev, data]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success('Service added');
    } catch {
      toast.error('Failed to add service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    setDeleteTarget(serviceId);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await shopApi.deleteService(deleteTarget);
      setServices((prev) => prev.filter((service) => service.id !== deleteTarget));
      toast('Service removed');
    } catch {
      toast.error('Failed to remove service');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="ql-page">
      <Breadcrumbs />
      <div className="ql-header">
        <div>
          <p className="ql-kicker">Catalog</p>
          <h1 className="ql-title">Services</h1>
          <p className="ql-subtitle">Keep the service list short and operational. Customers use this to pick the right counter before joining.</p>
        </div>
        <button onClick={() => setShowForm((value) => !value)} className="ql-btn-primary">
          {showForm ? 'Close form' : 'Add service'}
        </button>
      </div>

      {showForm ? (
        <section className="ql-panel mb-4">
          <div className="ql-panel-head">
            <h2 className="text-sm font-black text-stone-950">New service</h2>
            <p className="mt-0.5 text-xs text-stone-500">Use names staff will recognize at the counter.</p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-3 p-4 sm:grid-cols-2">
            <div>
              <label className="ql-label">Service name</label>
              <input
                required
                value={form.name}
                onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
                placeholder="Consultation"
                className="ql-field"
              />
            </div>
            <div>
              <label className="ql-label">Duration</label>
              <input
                type="number"
                min={5}
                max={480}
                value={form.durationMins}
                onChange={(event) => setForm((value) => ({ ...value, durationMins: Number(event.target.value) }))}
                className="ql-field"
              />
            </div>
            <div>
              <label className="ql-label">Price</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(event) => setForm((value) => ({ ...value, price: Number(event.target.value) }))}
                className="ql-field"
              />
            </div>
            <div>
              <label className="ql-label">Description</label>
              <input
                value={form.description}
                onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))}
                placeholder="Optional internal/customer note"
                className="ql-field"
              />
            </div>
            <div className="flex gap-2 pt-1 sm:col-span-2">
              <button type="submit" disabled={saving} className="ql-btn-primary">
                {saving ? 'Saving...' : 'Save service'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                }}
                className="ql-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="ql-panel">
        <div className="grid grid-cols-[minmax(0,1fr)_110px_110px_88px] gap-3 border-b border-stone-200 bg-stone-50/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
          <span>Service</span>
          <span>Duration</span>
          <span>Price</span>
          <span className="text-right">Action</span>
        </div>
        {loading ? (
          <div className="p-4">
            <LoadingSkeleton variant="list" count={3} />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorState message="Failed to load services" onRetry={loadServices} />
          </div>
        ) : services.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No services configured"
              description="Add the default services customers ask for most often."
              action={{ label: 'Add service', onClick: () => setShowForm(true) }}
            />
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="ql-row grid grid-cols-[minmax(0,1fr)_110px_110px_88px] items-center gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-stone-950">{service.name}</p>
                {service.description ? <p className="mt-0.5 truncate text-xs text-stone-500">{service.description}</p> : null}
              </div>
              <span className="text-sm font-semibold text-stone-700">{service.durationMins} min</span>
              <span className="text-sm font-semibold text-stone-700">{service.price === 0 ? 'Free' : `Rs ${service.price}`}</span>
              <button onClick={() => handleDelete(service.id)} className="justify-self-end text-xs font-bold text-red-700 hover:underline">
                Remove
              </button>
            </div>
          ))
        )}
      </section>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove service?"
        description="Existing queue entries will keep their service name, but new customers won't see this option."
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
