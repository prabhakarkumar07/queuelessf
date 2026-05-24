import { QRCodeCanvas } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../components/layout/DashboardLayout';

function ChecklistItem({ done, label, detail }: { done: boolean; label: string; detail: string }) {
  return (
    <div className="ql-row flex items-start gap-3">
      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-black ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-stone-300 bg-stone-50 text-stone-400'}`}>
        {done ? '✓' : ''}
      </div>
      <div>
        <p className="text-sm font-bold text-stone-950">{label}</p>
        <p className="mt-0.5 text-sm leading-6 text-stone-500">{detail}</p>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { activeShop } = useDashboard();
  const publicShopUrl = activeShop ? `${window.location.origin}/tv/${activeShop.id}` : '';
  const verificationStatus = activeShop?.verificationStatus ?? 'PENDING';

  const setupItems = [
    {
      done: Boolean(activeShop),
      label: 'Create shop profile',
      detail: 'Name, category, address, and customer support phone are required.',
    },
    {
      done: Boolean(activeShop?.openTime && activeShop?.closeTime),
      label: 'Set operating hours',
      detail: 'Hours drive queue availability and customer expectations.',
    },
    {
      done: Boolean(activeShop?.maxQueueSize && activeShop?.avgServiceMins),
      label: 'Tune queue capacity',
      detail: 'Capacity and average service time keep wait estimates believable.',
    },
    {
      done: verificationStatus === 'SUBMITTED' || verificationStatus === 'VERIFIED',
      label: 'Submit business verification',
      detail: 'Use registration, GSTIN, clinic license, or local trade ID.',
    },
  ];

  return (
    <div className="ql-page">
      <div className="ql-header">
        <div>
          <p className="ql-kicker">Readiness</p>
          <h1 className="ql-title">Launch setup</h1>
          <p className="ql-subtitle">A practical checklist for opening a branch queue without confusing customers or staff.</p>
        </div>
        <Link to="/dashboard/shops/new" className="ql-btn-primary">Edit shop details</Link>
      </div>

      {!activeShop ? (
        <div className="ql-empty">
          <div>
            <p className="font-bold text-stone-950">No shop selected</p>
            <p className="mt-1">Create a shop first, then finish launch setup.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="ql-panel">
            <div className="ql-panel-head">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-black text-stone-950">{activeShop.name}</h2>
                  <p className="mt-0.5 text-xs text-stone-500">Verification status: {verificationStatus}</p>
                </div>
                <span className={`ql-chip ${verificationStatus === 'VERIFIED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                  {activeShop.businessRegistrationNumber ? activeShop.businessRegistrationNumber : 'No ID submitted'}
                </span>
              </div>
            </div>
            <div>{setupItems.map((item) => <ChecklistItem key={item.label} {...item} />)}</div>
          </section>

          <section className="ql-panel">
            <div className="ql-panel-head">
              <h2 className="text-sm font-black text-stone-950">Counter QR</h2>
              <p className="mt-0.5 text-xs text-stone-500">Print this and place it where customers enter.</p>
            </div>
            <div className="p-4">
              <div className="rounded-lg border border-stone-200 bg-white p-4 text-center">
                <p className="text-base font-black text-stone-950">{activeShop.name}</p>
                <p className="mb-3 text-xs text-stone-500">Live queue display</p>
                <div className="inline-block rounded-md border border-stone-200 bg-white p-2">
                  <QRCodeCanvas value={publicShopUrl} size={168} />
                </div>
                <p className="mt-3 break-all text-[11px] leading-5 text-stone-500">{publicShopUrl}</p>
              </div>
              <button onClick={() => window.print()} className="ql-btn-secondary mt-3 w-full">Print poster</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
