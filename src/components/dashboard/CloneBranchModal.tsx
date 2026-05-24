import { useState } from 'react';
import toast from 'react-hot-toast';
import { shopApi } from '../../lib/api';
import { X, Copy, MapPin, Hash } from 'lucide-react';

interface CloneBranchModalProps {
  sourceShopId: string;
  sourceShopName: string;
  onClose: () => void;
  onSuccess: (newShop: any) => void;
}

export function CloneBranchModal({ sourceShopId, sourceShopName, onClose, onSuccess }: CloneBranchModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    newName: `${sourceShopName} (New Branch)`,
    newAddress: '',
    branchCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.newName || !form.newAddress || !form.branchCode) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data } = await shopApi.clone(sourceShopId, form);
      toast.success('New branch opened successfully!');
      onSuccess(data);
      onClose();
    } catch (err) {
      toast.error('Failed to open branch. Branch code might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Open New Branch</h3>
            <p className="text-xs text-slate-500">Cloning settings from {sourceShopName}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Branch Name</label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-slate-400">
                  <Copy size={16} />
                </div>
                <input
                  required
                  value={form.newName}
                  onChange={(e) => setForm({ ...form, newName: e.target.value })}
                  placeholder="e.g. City Care Clinic - South"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-[14px] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Unique Branch Code</label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-slate-400">
                  <Hash size={16} />
                </div>
                <input
                  required
                  value={form.branchCode}
                  onChange={(e) => setForm({ ...form, branchCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. BR-02"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-[14px] font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">Used for QR posters and internal tracking.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Branch Address</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-slate-400">
                  <MapPin size={16} />
                </div>
                <textarea
                  required
                  rows={3}
                  value={form.newAddress}
                  onChange={(e) => setForm({ ...form, newAddress: e.target.value })}
                  placeholder="Physical location of this branch"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-[14px] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-[14px] font-bold text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 py-2.5 text-[14px] font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Cloning...' : 'Open Branch'}
            </button>
          </div>
          
          <p className="mt-4 text-center text-[11px] text-slate-400">
            Services, timings, and settings will be copied from {sourceShopName}.
          </p>
        </form>
      </div>
    </div>
  );
}
