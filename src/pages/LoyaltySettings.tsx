import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useDashboard } from '../components/layout/DashboardLayout';
import { Breadcrumbs } from '../components/shared';
import { loyaltyApi } from '../lib/api';

export default function LoyaltySettings() {
  const { activeShop } = useDashboard();
  const activeShopId = activeShop?.id ?? '';
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    pointsPerVisit: 10,
    bronzeThreshold: 50,
    silverThreshold: 200,
    goldThreshold: 500,
  });

  useEffect(() => {
    if (!activeShopId) return;
    loyaltyApi
      .getConfig(activeShopId)
      .then(({ data }) => {
        setForm({
          pointsPerVisit: data.pointsPerVisit,
          bronzeThreshold: data.bronzeThreshold,
          silverThreshold: data.silverThreshold,
          goldThreshold: data.goldThreshold,
        });
      })
      .catch(() => toast.error('Failed to load loyalty configuration'));
  }, [activeShopId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeShopId) return;
    setSaving(true);
    try {
      await loyaltyApi.updateConfig(activeShopId, form);
      toast.success('Loyalty settings updated');
    } catch {
      toast.error('Failed to update loyalty settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ql-page-narrow">
      <Breadcrumbs />
      <div className="ql-header">
        <div>
          <p className="ql-kicker">Retention</p>
          <h1 className="ql-title">Loyalty settings</h1>
          <p className="ql-subtitle">Simple points rules work best. Keep thresholds easy for staff to explain at the counter.</p>
        </div>
      </div>

      <section className="ql-panel">
        <form onSubmit={handleSubmit}>
          <div className="ql-panel-head">
            <h2 className="text-sm font-black text-stone-950">Earning rule</h2>
          </div>
          <div className="grid gap-4 p-4">
            <div>
              <label className="ql-label">Points per completed visit</label>
              <input
                type="number"
                min={1}
                required
                value={form.pointsPerVisit}
                onChange={(event) => setForm({ ...form, pointsPerVisit: parseInt(event.target.value) || 0 })}
                className="ql-field max-w-xs"
              />
              <p className="mt-2 text-xs leading-5 text-stone-500">Awarded after a token or appointment is completed.</p>
            </div>
          </div>

          <div className="border-t border-stone-200 bg-stone-50/70 px-4 py-3">
            <h2 className="text-sm font-black text-stone-950">Tier thresholds</h2>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            {[
              ['Bronze', 'bronzeThreshold', 'border-amber-200 bg-amber-50 text-amber-800'],
              ['Silver', 'silverThreshold', 'border-stone-300 bg-stone-50 text-stone-700'],
              ['Gold', 'goldThreshold', 'border-yellow-200 bg-yellow-50 text-yellow-800'],
            ].map(([label, key, chipClass]) => (
              <div key={key} className="rounded-lg border border-stone-200 bg-white p-3">
                <span className={`ql-chip ${chipClass}`}>{label}</span>
                <label className="ql-label mt-3">Minimum points</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={form[key as keyof typeof form]}
                  onChange={(event) => setForm({ ...form, [key]: parseInt(event.target.value) || 0 })}
                  className="ql-field"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t border-stone-200 bg-[#fbfaf7] px-4 py-3">
            <button type="submit" disabled={saving} className="ql-btn-primary">
              {saving ? 'Saving...' : 'Save settings'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
