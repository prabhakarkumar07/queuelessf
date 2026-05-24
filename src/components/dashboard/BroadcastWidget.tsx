import { useState } from 'react';
import toast from 'react-hot-toast';
import { cx } from './TokenRow';
import { announcementApi } from '../../lib/api';
import type { Announcement } from '../../types';
import { Plus, Trash2, Megaphone, AlertCircle, Info, Send } from 'lucide-react';

const ANNOUNCEMENT_STYLES: Record<string, string> = {
  INFO: 'bg-blue-50 text-blue-700 border-blue-200',
  WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
  CLOSURE: 'bg-red-50 text-red-700 border-red-200',
};

const ANNOUNCEMENT_ICONS: Record<string, React.ElementType> = {
  INFO: Info,
  WARNING: AlertCircle,
  CLOSURE: Megaphone,
};

export function BroadcastWidget({
  shopId,
  announcements,
  setAnnouncements,
}: {
  shopId: string;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'INFO' as 'INFO' | 'WARNING' | 'CLOSURE',
  });

  const handlePost = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) return;
    setIsSubmitting(true);
    try {
      const { data } = await announcementApi.create(shopId, newAnnouncement);
      setAnnouncements((prev) => [data, ...prev]);
      setNewAnnouncement({ title: '', message: '', type: 'INFO' });
      setShowForm(false);
      toast.success('Announcement posted');
    } catch {
      toast.error('Failed to post announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await announcementApi.delete(id);
      setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== id));
      toast('Announcement removed');
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">Broadcasts</h3>
          <p className="text-[11px] text-slate-500">Messages for display boards.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 active:scale-95"
        >
          {showForm ? 'Cancel' : <><Plus size={14} /> New</>}
        </button>
      </div>

      <div className="transition-all duration-200 ease-in-out overflow-hidden" style={{ maxHeight: showForm ? '300px' : '0' }}>
        <div className="space-y-3 border-b border-slate-100 bg-white px-4 py-4">
          <input
            type="text"
            placeholder="Short title"
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement((v) => ({ ...v, title: e.target.value }))}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <textarea
            placeholder="Customer-facing message"
            rows={2}
            value={newAnnouncement.message}
            onChange={(e) => setNewAnnouncement((v) => ({ ...v, message: e.target.value }))}
            className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <select
              value={newAnnouncement.type}
              onChange={(e) =>
                setNewAnnouncement((v) => ({ ...v, type: e.target.value as 'INFO' | 'WARNING' | 'CLOSURE' }))
              }
              className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="CLOSURE">Closure</option>
            </select>
            <button
              onClick={handlePost}
              disabled={isSubmitting || !newAnnouncement.title.trim()}
              className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Send size={14} /> Post
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {announcements.length === 0 ? (
          <div className="px-4 py-8 flex flex-col items-center justify-center text-center">
            <Megaphone size={24} className="text-slate-300 mb-2" strokeWidth={1.5} />
            <p className="text-[13px] text-slate-500 font-medium">No active broadcasts</p>
          </div>
        ) : (
          announcements.slice(0, 4).map((announcement) => {
            const Icon = ANNOUNCEMENT_ICONS[announcement.type] || Info;
            return (
              <div key={announcement.id} className="px-4 py-3 group transition-colors hover:bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className={cx('mt-0.5 rounded-full p-1 border', ANNOUNCEMENT_STYLES[announcement.type])}>
                    <Icon size={12} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900">{announcement.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{announcement.message}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 rounded p-1.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
                    aria-label="Remove broadcast"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
