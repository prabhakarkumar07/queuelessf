import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useDashboard } from '../components/layout/DashboardLayout';
import { Breadcrumbs } from '../components/shared';
import { shopStatusApi } from '../lib/api';

interface Holiday {
  id: string;
  date: string;
  reason?: string;
}

export default function Holidays() {
  const { activeShop } = useDashboard();
  const activeShopId = activeShop?.id ?? '';
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', reason: '' });

  useEffect(() => {
    if (!activeShopId) return;
    setLoading(true);
    shopStatusApi
      .getHolidays(activeShopId)
      .then(({ data }) => setHolidays(data))
      .catch(() => toast.error('Failed to load holidays'))
      .finally(() => setLoading(false));
  }, [activeShopId]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeShopId) return;
    setSaving(true);
    try {
      const { data } = await shopStatusApi.addHoliday(activeShopId, { date: form.date, reason: form.reason || undefined });
      setHolidays((prev) => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)));
      setForm({ date: '', reason: '' });
      setShowForm(false);
      toast.success('Holiday added');
    } catch {
      toast.error('Failed to add holiday');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this holiday and reopen queue rules for that date?')) return;
    try {
      await shopStatusApi.deleteHoliday(id);
      setHolidays((prev) => prev.filter((holiday) => holiday.id !== id));
      toast('Holiday removed');
    } catch {
      toast.error('Failed to remove holiday');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = holidays.filter((holiday) => holiday.date >= today);
  const past = holidays.filter((holiday) => holiday.date < today);

  const HolidayRow = ({ holiday, muted = false }: { holiday: Holiday; muted?: boolean }) => (
    <div className={`ql-row flex items-center justify-between gap-3 ${muted ? 'opacity-55' : ''}`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md border border-stone-200 bg-stone-50">
          <span className="text-sm font-black text-stone-950">{format(new Date(`${holiday.date}T00:00:00`), 'dd')}</span>
          <span className="text-[10px] font-bold uppercase text-stone-500">{format(new Date(`${holiday.date}T00:00:00`), 'MMM')}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-stone-950">{format(new Date(`${holiday.date}T00:00:00`), 'EEEE, MMMM d, yyyy')}</p>
          <p className="truncate text-xs text-stone-500">{holiday.reason || 'No reason added'}</p>
        </div>
      </div>
      <button onClick={() => handleDelete(holiday.id)} className="ql-btn-danger">Remove</button>
    </div>
  );

  return (
    <div className="ql-page">
      <Breadcrumbs />
      <div className="ql-header">
        <div>
          <p className="ql-kicker">Calendar rules</p>
          <h1 className="ql-title">Holidays</h1>
          <p className="ql-subtitle">Close queue creation for known holidays and maintenance days before customers arrive.</p>
        </div>
        <button onClick={() => setShowForm((value) => !value)} className="ql-btn-primary">
          {showForm ? 'Close form' : 'Add holiday'}
        </button>
      </div>

      {showForm ? (
        <section className="ql-panel mb-4">
          <form onSubmit={handleCreate} className="grid gap-3 p-4 sm:grid-cols-[180px_1fr_auto] sm:items-end">
            <div>
              <label className="ql-label">Date</label>
              <input required type="date" min={today} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="ql-field" />
            </div>
            <div>
              <label className="ql-label">Reason</label>
              <input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Diwali, audit day, local closure" className="ql-field" />
            </div>
            <button type="submit" disabled={saving} className="ql-btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </form>
        </section>
      ) : null}

      <section className="ql-panel">
        {loading ? (
          <div className="flex h-44 items-center justify-center"><div className="ql-spinner" /></div>
        ) : upcoming.length === 0 && past.length === 0 ? (
          <div className="ql-empty m-4">
            <div>
              <p className="font-bold text-stone-950">No holidays marked</p>
              <p className="mt-1">Add upcoming closures so the queue does not accept customers by mistake.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="ql-panel-head"><h2 className="text-sm font-black text-stone-950">Upcoming</h2></div>
            {upcoming.length ? upcoming.map((holiday) => <HolidayRow key={holiday.id} holiday={holiday} />) : <div className="px-4 py-5 text-sm text-stone-500">No upcoming holidays.</div>}
            {past.length ? (
              <>
                <div className="border-y border-stone-200 bg-stone-50/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">Past</div>
                {past.map((holiday) => <HolidayRow key={holiday.id} holiday={holiday} muted />)}
              </>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
