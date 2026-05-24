import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { tokenApi } from '../../lib/api';
import type { Token } from '../../types';

type TokenReasonAction = 'cancel' | 'skip';

const ACTION_COPY: Record<TokenReasonAction, { title: string; button: string; placeholder: string; success: string }> = {
  cancel: {
    title: 'Cancel token',
    button: 'Cancel token',
    placeholder: 'Duplicate token, customer left, wrong branch, created by mistake',
    success: 'Token cancelled',
  },
  skip: {
    title: 'Skip token',
    button: 'Skip token',
    placeholder: 'Customer not present, called twice, asked to come later',
    success: 'Token skipped',
  },
};

export function TokenReasonModal({
  token,
  action,
  onClose,
  onDone,
}: {
  token: Token;
  action: TokenReasonAction;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const copy = ACTION_COPY[action];

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const body = { reason: reason.trim() || undefined };
      if (action === 'cancel') {
        await tokenApi.cancel(token.id, body);
      } else {
        await tokenApi.skip(token.id, body);
      }
      toast.success(copy.success);
      onDone();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? `Could not ${action} token`;
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="ql-kicker">{copy.title}</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{token.displayNumber}</h2>
            <p className="mt-0.5 text-sm font-medium text-slate-500">{token.userName || 'Walk-in customer'}</p>
          </div>
        </div>

        <div className="mt-6">
          <label className="ql-label">Reason</label>
          <textarea
            className="ql-field min-h-24 resize-none"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={copy.placeholder}
            maxLength={500}
          />
          <p className="mt-1.5 text-xs text-slate-500">Saved on the token record for staff context and future reporting.</p>
        </div>

        <div className="mt-8 flex gap-3">
          <button type="button" onClick={onClose} className="ql-btn-secondary flex-1" disabled={saving}>
            Keep token
          </button>
          <button type="submit" className={action === 'cancel' ? 'ql-btn-danger flex-1' : 'ql-btn-primary flex-1'} disabled={saving}>
            {saving ? 'Saving...' : copy.button}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
