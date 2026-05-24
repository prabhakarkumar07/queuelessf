import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { useDashboard } from '../components/layout/DashboardLayout';
import { Breadcrumbs } from '../components/shared';
import { announcementApi } from '../lib/api';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  active: boolean;
  validTo?: string;
  createdAt: string;
}

const typeStyle: Record<string, string> = {
  INFO: 'border-blue-200 bg-blue-50 text-blue-700',
  WARNING: 'border-amber-200 bg-amber-50 text-amber-800',
  CLOSURE: 'border-red-200 bg-red-50 text-red-700',
};

export default function Announcements() {
  const { activeShop } = useDashboard();
  const activeShopId = activeShop?.id ?? '';
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'INFO', expiresAt: '' });

  useEffect(() => {
    if (!activeShopId) return;
    setLoading(true);
    announcementApi
      .getAll(activeShopId)
      .then(({ data }) => setAnnouncements(data))
      .catch(() => toast.error('Failed to load announcements'))
      .finally(() => setLoading(false));
  }, [activeShopId]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeShopId) return;
    setSaving(true);
    try {
      const { data } = await announcementApi.create(activeShopId, {
        title: form.title,
        message: form.message,
        type: form.type,
        validTo: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      });
      setAnnouncements((prev) => [data, ...prev]);
      setForm({ title: '', message: '', type: 'INFO', expiresAt: '' });
      setShowForm(false);
      toast.success('Announcement posted');
    } catch {
      toast.error('Failed to post announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement from customer displays?')) return;
    try {
      await announcementApi.delete(id);
      setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== id));
      toast('Announcement removed');
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div className="ql-page">
      <Breadcrumbs />
      <div className="ql-header">
        <div>
          <p className="ql-kicker">Customer communication</p>
          <h1 className="ql-title">Announcements</h1>
          <p className="ql-subtitle">Operational notices for customers and display boards. Keep messages short and time-bound.</p>
        </div>
        <button onClick={() => setShowForm((value) => !value)} className="ql-btn-primary">
          {showForm ? 'Close form' : 'New announcement'}
        </button>
      </div>

      {showForm ? (
        <section className="ql-panel mb-4">
          <div className="ql-panel-head">
            <h2 className="text-sm font-black text-stone-950">Compose announcement</h2>
          </div>
          <form onSubmit={handleCreate} className="grid gap-3 p-4">
            <div>
              <label className="ql-label">Title</label>
              <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Lunch break delay" className="ql-field" />
            </div>
            <div>
              <label className="ql-label">Message</label>
              <textarea required rows={3} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Write the customer-facing message..." className="ql-field resize-none" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="ql-label">Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="ql-field">
                  <option value="INFO">Information</option>
                  <option value="WARNING">Warning</option>
                  <option value="CLOSURE">Closure</option>
                </select>
              </div>
              <div>
                <label className="ql-label">Expires at</label>
                <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className="ql-field" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="ql-btn-primary">{saving ? 'Posting...' : 'Post announcement'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="ql-btn-secondary">Cancel</button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="ql-panel">
        {loading ? (
          <div className="flex h-44 items-center justify-center"><div className="ql-spinner" /></div>
        ) : announcements.length === 0 ? (
          <div className="ql-empty m-4">
            <div>
              <p className="font-bold text-stone-950">No announcements yet</p>
              <p className="mt-1">Post notices only when they change customer behavior.</p>
            </div>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="ql-row flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`ql-chip ${typeStyle[announcement.type] ?? ''}`}>{announcement.type}</span>
                  <span className={`ql-chip ${announcement.active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : ''}`}>
                    {announcement.active ? 'Active' : 'Expired'}
                  </span>
                  <span className="text-xs text-stone-500">Posted {formatDistanceToNow(new Date(announcement.createdAt))} ago</span>
                </div>
                <p className="mt-2 text-sm font-bold text-stone-950">{announcement.title}</p>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600">{announcement.message}</p>
                {announcement.validTo ? <p className="mt-1 text-xs text-stone-500">Expires {new Date(announcement.validTo).toLocaleString()}</p> : null}
              </div>
              <button onClick={() => handleDelete(announcement.id)} className="ql-btn-danger self-start">Remove</button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
