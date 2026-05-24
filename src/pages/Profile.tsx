import { useRef, useState, type FormEvent, type ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { Camera, Mail, Phone, Shield, KeyRound, Save, Lock, Trash2, Upload } from 'lucide-react';
import { profileApi, mediaApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Breadcrumbs } from '../components/shared';

// ─── Helpers ────────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  SHOP_OWNER: 'Shop Owner',
  SERVICE_PROVIDER: 'Service Provider',
  CUSTOMER: 'Customer',
  ADMIN: 'Administrator',
};

function initials(name?: string) {
  return (
    name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || 'QL'
  );
}

function Field({
  label,
  value,
  icon: Icon,
  muted,
}: {
  label: string;
  value?: string;
  icon: React.ElementType;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50/50 px-4 py-3">
      <Icon size={15} className="shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className={`truncate text-[14px] font-medium ${muted ? 'text-slate-400 italic' : 'text-slate-900'}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

// ─── Avatar Upload Component ─────────────────────────────────
function AvatarUpload() {
  const { user, updateUser } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await mediaApi.uploadAvatar(file);
      updateUser({ avatarUrl: data.url });
      setPreview(null);
      toast.success('Profile photo updated');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      await mediaApi.removeAvatar();
      updateUser({ avatarUrl: undefined });
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Profile photo removed');
    } catch {
      toast.error('Failed to remove photo');
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = preview ?? user?.avatarUrl;

  return (
    <div className="mb-5 flex items-end gap-4">
      {/* Avatar circle */}
      <div className="relative">
        <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100">
          {displayUrl ? (
            <img src={displayUrl} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-600">
              {initials(user?.name)}
            </div>
          )}
        </div>
        {/* Camera overlay */}
        <button
          type="button"
          id="avatar-pick-btn"
          onClick={() => fileRef.current?.click()}
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-colors hover:bg-slate-50"
          title="Change photo"
        >
          <Camera size={12} className="text-slate-600" />
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        id="avatar-file-input"
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />

      {/* Actions — only shown after file is selected */}
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <Upload size={12} />
            {preview ? 'Choose different' : 'Upload photo'}
          </button>

          {preview && (
            <button
              type="button"
              id="avatar-save-btn"
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              {uploading ? 'Saving...' : 'Save photo'}
            </button>
          )}

          {user?.avatarUrl && !preview && (
            <button
              type="button"
              id="avatar-remove-btn"
              onClick={handleRemove}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              <Trash2 size={12} />
              Remove
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-400">JPEG, PNG, or WebP · max 5 MB</p>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function Profile() {
  const { user, updateUser } = useAuthStore();

  // ── Edit profile form ──
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Change password form ──
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // ── Danger Zone ──
  const [deletingAccount, setDeletingAccount] = useState(false);

  // ── Google OAuth user? ──
  const isOAuthUser = user?.email && (!user?.phone || user.phone === '');

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSavingProfile(true);
    try {
      const { data } = await profileApi.update({ name: name.trim(), email: email.trim() || undefined });
      updateUser({ name: data.name, email: data.email });
      setEditing(false);
      toast.success('Profile updated');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSavingPassword(true);
    try {
      await profileApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setShowPasswordForm(false);
      toast.success('Password changed successfully');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to change password';
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account? All your data will be anonymized.')) return;
    setDeletingAccount(true);
    try {
      await profileApi.deleteAccount();
      toast.success('Account deleted successfully');
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete account';
      toast.error(msg);
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="ql-page max-w-2xl">
      <Breadcrumbs />
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">My Profile</h1>
        <p className="mt-0.5 text-[13px] text-slate-500">Manage your account information and security settings.</p>
      </div>

      {/* ── Profile Card ── */}
      <section className="mb-5 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3">
          <h2 className="text-[14px] font-semibold text-slate-900">Account details</h2>
          {!editing && (
            <button
              id="profile-edit-btn"
              onClick={() => { setName(user?.name ?? ''); setEmail(user?.email ?? ''); setEditing(true); }}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 active:scale-95"
            >
              Edit
            </button>
          )}
        </div>

        {!editing ? (
          <div className="space-y-2 p-5">
            <AvatarUpload />
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[16px] font-semibold text-slate-900">{user?.name}</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                <Shield size={10} />
                {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
              </span>
            </div>
            <Field label="Phone" value={user?.phone} icon={Phone} muted={!user?.phone} />
            <Field label="Email" value={user?.email} icon={Mail} muted={!user?.email} />
          </div>
        ) : (
          <form id="profile-form" onSubmit={handleProfileSave} className="space-y-4 p-5">
            <div>
              <label className="ql-label">Full name <span className="text-red-500">*</span></label>
              <input id="profile-name" required value={name} onChange={e => setName(e.target.value)}
                className="ql-field" placeholder="Your full name" maxLength={100} />
            </div>
            <div>
              <label className="ql-label">Email address</label>
              <input id="profile-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="ql-field" placeholder="you@example.com" />
              <p className="mt-1 text-[11px] text-slate-400">Optional. Used for notifications and account recovery.</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" id="profile-save-btn" disabled={savingProfile}
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50">
                <Save size={14} />
                {savingProfile ? 'Saving...' : 'Save changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ── Change Password Card ── */}
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3">
          <h2 className="text-[14px] font-semibold text-slate-900">Password</h2>
          {!showPasswordForm && !isOAuthUser && (
            <button id="profile-change-password-btn" onClick={() => setShowPasswordForm(true)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 active:scale-95">
              Change
            </button>
          )}
        </div>

        {isOAuthUser ? (
          <div className="flex items-center gap-3 px-5 py-4 text-[13px] text-slate-500">
            <Lock size={14} className="shrink-0 text-slate-400" />
            Your account uses Google sign-in. Password change is not available.
          </div>
        ) : !showPasswordForm ? (
          <div className="flex items-center gap-3 px-5 py-4 text-[13px] text-slate-500">
            <KeyRound size={14} className="shrink-0 text-slate-400" />
            Use a strong password of at least 8 characters.
          </div>
        ) : (
          <form id="password-form" onSubmit={handlePasswordChange} className="space-y-4 p-5">
            <div>
              <label className="ql-label">Current password <span className="text-red-500">*</span></label>
              <input id="profile-current-password" type="password" required value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)} className="ql-field"
                placeholder="Your current password" autoComplete="current-password" />
            </div>
            <div>
              <label className="ql-label">New password <span className="text-red-500">*</span></label>
              <input id="profile-new-password" type="password" required value={newPassword}
                onChange={e => setNewPassword(e.target.value)} className="ql-field"
                placeholder="At least 8 characters" autoComplete="new-password" minLength={8} />
            </div>
            <div>
              <label className="ql-label">Confirm new password <span className="text-red-500">*</span></label>
              <input id="profile-confirm-password" type="password" required value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} className="ql-field"
                placeholder="Repeat new password" autoComplete="new-password" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" id="profile-save-password-btn" disabled={savingPassword}
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50">
                <KeyRound size={14} />
                {savingPassword ? 'Updating...' : 'Update password'}
              </button>
              <button type="button"
                onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ── Danger Zone ── */}
      <section className="mt-8 rounded-md border border-red-200 bg-red-50/50 shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-red-800">Delete Account</h2>
            <p className="mt-1 text-[13px] text-red-600/80">
              Permanently delete your personal data and active queue tokens. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="shrink-0 rounded-md bg-red-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
          >
            {deletingAccount ? 'Deleting...' : 'Delete account'}
          </button>
        </div>
      </section>
    </div>
  );
}
