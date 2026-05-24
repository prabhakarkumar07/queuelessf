import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLogout } from '../hooks/useLogout';
import { shopApi } from '../lib/api';
import type { ShopCategory, Weekday } from '../types';

interface ShopForm {
  name: string;
  category: ShopCategory;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  openTime: string;
  closeTime: string;
  breakStartTime: string;
  breakEndTime: string;
  closedDays: Weekday[];
  avgServiceMins: number;
  maxQueueSize: number;
  primaryColor: string;
  logoUrl: string;
  businessRegistrationNumber: string;
}

const CATEGORIES: { value: ShopCategory; label: string }[] = [
  { value: 'CLINIC', label: 'Clinic' },
  { value: 'SALON', label: 'Salon' },
  { value: 'BANK', label: 'Bank' },
  { value: 'GOVERNMENT', label: 'Government Office' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'OTHER', label: 'Other' },
];

const WEEKDAYS: Weekday[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const EMPTY_FORM: ShopForm = {
  name: '',
  category: 'OTHER',
  description: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  openTime: '09:00',
  closeTime: '18:00',
  breakStartTime: '',
  breakEndTime: '',
  closedDays: [],
  avgServiceMins: 15,
  maxQueueSize: 50,
  primaryColor: '#d97706',
  logoUrl: '',
  businessRegistrationNumber: '',
};

export default function CreateShop() {
  const navigate = useNavigate();
  const logout = useLogout();
  const [form, setForm] = useState<ShopForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const updateForm = <K extends keyof ShopForm>(field: K, value: ShopForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleClosedDay = (day: Weekday) => {
    setForm((prev) => ({
      ...prev,
      closedDays: prev.closedDays.includes(day) ? prev.closedDays.filter((item) => item !== day) : [...prev.closedDays, day],
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await shopApi.create({
        ...form,
        breakStartTime: form.breakStartTime || null,
        breakEndTime: form.breakEndTime || null,
        businessRegistrationNumber: form.businessRegistrationNumber || null,
      });
      toast.success('Shop created');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create shop. Please check your details.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ql-app-bg text-stone-950">
      <header className="sticky top-0 z-40 border-b border-stone-200 ql-topbar backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="ql-btn-secondary py-1.5 text-xs">Back</button>
            <div>
              <p className="text-sm font-black">Create shop</p>
              <p className="text-xs text-stone-500">Branch profile and queue defaults</p>
            </div>
          </div>
          <button onClick={logout} className="ql-btn-danger">Log out</button>
        </div>
      </header>

      <main className="ql-page max-w-5xl">
        <div className="ql-header">
          <div>
            <p className="ql-kicker">Workspace setup</p>
            <h1 className="ql-title">Set up your shop</h1>
            <p className="ql-subtitle">Capture the minimum useful branch details now. You can tune services, staff, and announcements after creation.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <section className="ql-panel">
            <div className="ql-panel-head"><h2 className="text-sm font-black text-stone-950">Shop identity</h2></div>
            <div className="grid gap-3 p-4 md:grid-cols-2">
              <div>
                <label className="ql-label">Shop name</label>
                <input required value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="City Care Clinic" className="ql-field" />
              </div>
              <div>
                <label className="ql-label">Category</label>
                <select required value={form.category} onChange={(e) => updateForm('category', e.target.value as ShopCategory)} className="ql-field">
                  {CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="ql-label">Description</label>
                <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={3} placeholder="What customers should know before joining..." className="ql-field resize-none" />
              </div>
            </div>
          </section>

          <section className="ql-panel">
            <div className="ql-panel-head"><h2 className="text-sm font-black text-stone-950">Location and contact</h2></div>
            <div className="grid gap-3 p-4 md:grid-cols-3">
              <div className="md:col-span-3">
                <label className="ql-label">Street address</label>
                <input required value={form.address} onChange={(e) => updateForm('address', e.target.value)} className="ql-field" />
              </div>
              <div>
                <label className="ql-label">City</label>
                <input required value={form.city} onChange={(e) => updateForm('city', e.target.value)} className="ql-field" />
              </div>
              <div>
                <label className="ql-label">State</label>
                <input required value={form.state} onChange={(e) => updateForm('state', e.target.value)} className="ql-field" />
              </div>
              <div>
                <label className="ql-label">Pincode</label>
                <input required pattern="\d{6}" value={form.pincode} onChange={(e) => updateForm('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} className="ql-field" />
              </div>
              <div>
                <label className="ql-label">Phone</label>
                <input required pattern="^[6-9]\d{9}$" value={form.phone} onChange={(e) => updateForm('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} className="ql-field" />
              </div>
              <div className="md:col-span-2">
                <label className="ql-label">Registration / GST / License ID</label>
                <input value={form.businessRegistrationNumber} onChange={(e) => updateForm('businessRegistrationNumber', e.target.value)} placeholder="Optional but recommended" className="ql-field" />
              </div>
            </div>
          </section>

          <section className="ql-panel">
            <div className="ql-panel-head"><h2 className="text-sm font-black text-stone-950">Hours and queue rules</h2></div>
            <div className="grid gap-3 p-4 md:grid-cols-4">
              <div>
                <label className="ql-label">Open</label>
                <input type="time" value={form.openTime} onChange={(e) => updateForm('openTime', e.target.value)} className="ql-field" />
              </div>
              <div>
                <label className="ql-label">Close</label>
                <input type="time" value={form.closeTime} onChange={(e) => updateForm('closeTime', e.target.value)} className="ql-field" />
              </div>
              <div>
                <label className="ql-label">Break start</label>
                <input type="time" value={form.breakStartTime} onChange={(e) => updateForm('breakStartTime', e.target.value)} className="ql-field" />
              </div>
              <div>
                <label className="ql-label">Break end</label>
                <input type="time" value={form.breakEndTime} onChange={(e) => updateForm('breakEndTime', e.target.value)} className="ql-field" />
              </div>
              <div>
                <label className="ql-label">Avg service mins</label>
                <input type="number" min="1" max="120" value={form.avgServiceMins} onChange={(e) => updateForm('avgServiceMins', parseInt(e.target.value, 10) || 15)} className="ql-field" />
              </div>
              <div>
                <label className="ql-label">Max queue size</label>
                <input type="number" min="10" max="500" value={form.maxQueueSize} onChange={(e) => updateForm('maxQueueSize', parseInt(e.target.value, 10) || 50)} className="ql-field" />
              </div>
              <div className="md:col-span-2">
                <label className="ql-label">Weekly closed days</label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => {
                    const selected = form.closedDays.includes(day);
                    return (
                      <button key={day} type="button" onClick={() => toggleClosedDay(day)} className={selected ? 'ql-btn-primary py-1.5 text-xs' : 'ql-btn-secondary py-1.5 text-xs'}>
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="ql-panel">
            <div className="ql-panel-head"><h2 className="text-sm font-black text-stone-950">Branding</h2></div>
            <div className="grid gap-3 p-4 md:grid-cols-2">
              <div>
                <label className="ql-label">Brand color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.primaryColor} onChange={(e) => updateForm('primaryColor', e.target.value)} className="h-10 w-12 rounded-md border border-stone-200 bg-white p-1" />
                  <span className="font-mono text-sm font-bold text-stone-700">{form.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="ql-label">Logo URL</label>
                <input type="url" value={form.logoUrl} onChange={(e) => updateForm('logoUrl', e.target.value)} placeholder="https://example.com/logo.png" className="ql-field" />
              </div>
            </div>
          </section>

          <div className="sticky bottom-0 -mx-4 border-t border-stone-200 ql-topbar px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <div className="mx-auto flex max-w-5xl justify-end gap-2">
              <button type="button" onClick={() => navigate('/dashboard')} className="ql-btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="ql-btn-primary">{loading ? 'Creating...' : 'Create shop'}</button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
