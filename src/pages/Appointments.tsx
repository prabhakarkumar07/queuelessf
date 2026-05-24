import { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../components/layout/DashboardLayout';
import { Breadcrumbs } from '../components/shared';
import { appointmentApi } from '../lib/api';
import type { Appointment } from '../types';
import { 
  CalendarDays, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  ChevronRight,
  Ban
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  RESCHEDULED: { label: 'Rescheduled', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CalendarDays },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  COMPLETED: { label: 'Completed', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: CheckCircle2 },
};

export default function Appointments() {
  const { activeShop } = useDashboard();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadAppointments = useCallback(async () => {
    if (!activeShop) return;
    setLoading(true);
    try {
      const { data } = await appointmentApi.getByShop(activeShop.id, page, 10);
      setAppointments(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [activeShop, page]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentApi.cancel(id, 'Cancelled by shop owner');
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await appointmentApi.complete(id);
      toast.success('Appointment marked as complete');
      loadAppointments();
    } catch {
      toast.error('Failed to complete appointment');
    }
  };

  const filteredAppointments = statusFilter === 'ALL' 
    ? appointments 
    : appointments.filter(a => a.status === statusFilter);

  return (
    <div className="ql-page">
      <Breadcrumbs />
      <div className="ql-header">
        <div>
          <p className="ql-kicker">Schedule Management</p>
          <h1 className="ql-title">Bookings & Appointments</h1>
          <p className="ql-subtitle">View and manage upcoming customer bookings for {activeShop?.name}.</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'CONFIRMED', 'PENDING', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-slate-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="ql-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Customer</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Service</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Schedule</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Payment</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-4 w-full rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Ban size={40} strokeWidth={1.5} className="mb-3" />
                      <p className="text-sm font-medium">No appointments found</p>
                      <p className="text-xs">Try changing your filters or check back later.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => {
                  const status = STATUS_CONFIG[appt.status] || STATUS_CONFIG.PENDING;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={appt.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Customer</p>
                            <p className="text-[11px] text-slate-500">ID: {appt.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-700">{appt.serviceName}</p>
                        <p className="text-[11px] text-slate-500">{appt.durationMins} mins</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                            <CalendarDays size={14} className="text-slate-400" />
                            {format(new Date(appt.scheduledAt), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                            <Clock size={14} className="text-slate-400" />
                            {format(new Date(appt.scheduledAt), 'hh:mm a')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.color}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-slate-900">₹{appt.amount}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-tight ${
                            appt.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {appt.paymentStatus}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(appt.status === 'CONFIRMED' || appt.status === 'RESCHEDULED') && (
                            <button
                              onClick={() => handleComplete(appt.id)}
                              className="rounded-md bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              title="Mark as Complete"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleCancel(appt.id)}
                              className="rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors"
                              title="Cancel Appointment"
                            >
                              <Ban size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
