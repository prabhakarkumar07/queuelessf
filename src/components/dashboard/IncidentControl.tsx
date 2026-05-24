import React, { useState } from 'react';
import { AlertTriangle, Info, XCircle, CheckCircle, Save, Loader2 } from 'lucide-react';
import { shopApi } from '../../lib/api';
import { Shop } from '../../types';
import toast from 'react-hot-toast';

interface IncidentControlProps {
  shop: Shop;
  onUpdate: (updatedShop: Shop) => void;
}

export const IncidentControl: React.FC<IncidentControlProps> = ({ shop, onUpdate }) => {
  const [status, setStatus] = useState(shop.incidentStatus || 'NORMAL');
  const [message, setMessage] = useState(shop.incidentMessage || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const { data } = await shopApi.updateIncident(shop.id, { status, message });
      onUpdate(data);
      toast.success('Incident status updated');
    } catch (error) {
      toast.error('Failed to update incident status');
    } finally {
      setLoading(false);
    }
  };

  const statusConfigs = {
    NORMAL: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Operations Normal' },
    DELAYED: { icon: Info, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Expected Delays' },
    EMERGENCY_CLOSURE: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Emergency Closure' },
    SYSTEM_DOWN: { icon: AlertTriangle, color: 'text-slate-600', bg: 'bg-slate-50', label: 'Technical Issues' },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-slate-800">Incident & Emergency Control</h3>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfigs[status as keyof typeof statusConfigs].bg} ${statusConfigs[status as keyof typeof statusConfigs].color}`}>
          {React.createElement(statusConfigs[status as keyof typeof statusConfigs].icon, { className: 'h-3.5 w-3.5' })}
          {statusConfigs[status as keyof typeof statusConfigs].label}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Operational Status</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(statusConfigs).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setStatus(key)}
                className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                  status === key
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <config.icon className="h-4 w-4" />
                {config.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Public Broadcast Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Doctor is running 30 mins late due to an emergency surgery. We apologize for the wait."
            className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            This message will be visible to all customers on your public profile and booking page.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Update Broadcast Status
          </button>
        </div>
      </div>
    </div>
  );
};
