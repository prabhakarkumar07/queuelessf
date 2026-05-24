import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Loader2, Smartphone, ShieldCheck } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { AuthResponse } from '../types';

// ─── Validation helpers ─────────────────────────────────────
function isValidPhone(phone: string) {
  return /^[6-9]\d{9}$/.test(phone);
}

function getPhoneError(phone: string, touched: boolean) {
  if (!touched || phone === '') return '';
  if (phone.length < 10 || !isValidPhone(phone)) return 'Enter a valid 10-digit mobile number';
  return '';
}

function getPasswordError(password: string, touched: boolean) {
  if (!touched || password === '') return '';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return '';
}

// ─── Inline error component ─────────────────────────────────
function FieldError({ message, id }: { message: string; id?: string }) {
  if (!message) return null;
  return <p id={id} className="mt-1 text-[12px] font-medium text-red-600">{message}</p>;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const queryMode = new URLSearchParams(location.search).get('account');
  const [accountMode, setAccountMode] = useState<'business' | 'customer'>(queryMode === 'customer' ? 'customer' : 'business');
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'CUSTOMER') navigate('/customer', { replace: true });
      else if (user.role === 'SERVICE_PROVIDER') navigate('/staff', { replace: true });
      else if (['SUPER_ADMIN', 'OPS_ADMIN', 'SUPPORT_AGENT', 'FINANCE_ADMIN'].includes(user.role)) navigate('/admin', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Touched state for validation
  const [touched, setTouched] = useState({ name: false, phone: false, password: false, confirmPassword: false });

  // Loading
  const [loading, setLoading] = useState(false);

  // Refs
  const phoneRef = useRef<HTMLInputElement>(null);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // Validation errors
  const phoneError = getPhoneError(phone, touched.phone);
  const passwordError = getPasswordError(password, touched.password);
  const nameError = touched.name && !name.trim() ? 'Name is required' : '';
  const confirmError = touched.confirmPassword && confirmPassword !== password ? 'Passwords do not match' : '';

  const finishAuth = (data: AuthResponse, message: string) => {
    setAuth(data.user, data.accessToken, data.refreshToken);
    if (data.user.role === 'CUSTOMER') navigate('/customer');
    else if (data.user.role === 'SERVICE_PROVIDER') navigate('/staff');
    else if (['SUPER_ADMIN', 'OPS_ADMIN', 'SUPPORT_AGENT', 'FINANCE_ADMIN'].includes(data.user.role)) navigate('/admin');
    else navigate('/dashboard');
    toast.success(message);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    // Mark all fields as touched
    setTouched({ name: true, phone: true, password: true, confirmPassword: true });

    // Validate
    if (!isValidPhone(phone)) { phoneRef.current?.focus(); return; }
    if (isRegister && !name.trim()) return;
    if (password.length < 8) return;
    if (isRegister && confirmPassword !== password) return;

    setLoading(true);
    try {
      const response = isRegister
        ? ((await authApi.register({ name: name.trim(), phone, password, role: accountMode === 'customer' ? 'CUSTOMER' : 'SHOP_OWNER' })) as { data: AuthResponse })
        : ((await authApi.login({ phone, password })) as { data: AuthResponse });

      finishAuth(response.data, isRegister ? 'Account created successfully' : `Welcome back, ${response.data.user.name}`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        toast.error('Too many attempts. Please try again later.');
      } else {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? (isRegister ? 'Registration failed. Check your details.' : 'Login failed. Check your credentials.');
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    setTouched((t) => ({ ...t, phone: true }));
    if (!isValidPhone(phone)) { phoneRef.current?.focus(); return; }
    setOtpLoading(true);
    try {
      await authApi.requestOtp(phone);
      setOtpSent(true);
      setResendTimer(60);
      toast.success('OTP sent to your phone');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) toast.error('Too many attempts. Please try again later.');
      else toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Could not send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!isValidPhone(phone) || otp.length !== 6) {
      toast.error('Enter your phone number and 6-digit OTP');
      return;
    }
    setOtpLoading(true);
    try {
      const { data } = (await authApi.verifyOtp(phone, otp)) as { data: AuthResponse };
      finishAuth(data, `Welcome back, ${data.user.name}`);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl items-center gap-10 lg:grid-cols-[1fr_440px]" style={{ animation: 'ql-enter 150ms ease-out both' }}>

        {/* ─── Left Panel (Desktop) ─── */}
        <section className="hidden lg:block" aria-hidden="true">
          <Link to="/" className="mb-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="QueueLess Logo" className="h-10 w-10 rounded object-cover" />
            <div>
              <p className="text-[15px] font-bold tracking-tight text-slate-900">QueueLess</p>
              <p className="text-[11px] font-semibold text-slate-500">
                {accountMode === 'customer' ? 'Customer portal' : 'Branch operations console'}
              </p>
            </div>
          </Link>

          <h1 className="max-w-md text-[2.25rem] font-bold leading-[1.15] tracking-tight text-slate-900">
            {accountMode === 'customer'
              ? 'Skip the crowd, keep your place.'
              : 'Run your queue without the chaos.'}
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-6 text-slate-500">
            {accountMode === 'customer'
              ? 'Browse shops, join queues remotely, track your turn in real time, and book appointments — all from your phone or browser.'
              : 'Digital tokens, live queue tracking, staff controls, appointment booking, and analytics — built for clinics, salons, banks, and service businesses.'}
          </p>

          <div className="mt-8 grid max-w-md grid-cols-3 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-r border-slate-200 p-3.5 text-center">
              <p className="text-lg font-black text-slate-900">Live</p>
              <p className="text-[10px] font-semibold text-slate-500">Queue sync</p>
            </div>
            <div className="border-r border-slate-200 p-3.5 text-center">
              <p className="text-lg font-black text-slate-900">Staff</p>
              <p className="text-[10px] font-semibold text-slate-500">Availability</p>
            </div>
            <div className="p-3.5 text-center">
              <p className="text-lg font-black text-slate-900">TV</p>
              <p className="text-[10px] font-semibold text-slate-500">Display board</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-[12px] text-slate-400">
            <ShieldCheck size={14} />
            <span>256-bit encrypted · SOC 2 compliant infrastructure</span>
          </div>
        </section>

        {/* ─── Right Panel (Form) ─── */}
        <section className="w-full">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
              {/* Mobile logo */}
              <Link to="/" className="mb-4 flex items-center gap-2.5 lg:hidden hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="QueueLess Logo" className="h-8 w-8 rounded object-cover" />
                <span className="text-[14px] font-bold tracking-tight text-slate-900">QueueLess</span>
              </Link>

              {/* Role selector */}
              <div className="mb-4 grid grid-cols-2 gap-1 rounded-md border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setAccountMode('business')}
                  className={`rounded-[5px] px-3 py-2 text-[12px] font-bold transition-all ${accountMode === 'business' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Business
                </button>
                <button
                  type="button"
                  onClick={() => setAccountMode('customer')}
                  className={`rounded-[5px] px-3 py-2 text-[12px] font-bold transition-all ${accountMode === 'customer' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Customer
                </button>
              </div>

              <p className="ql-kicker">
                {isRegister
                  ? (accountMode === 'customer' ? 'Create customer account' : 'Create business account')
                  : 'Secure sign in'}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                {isRegister
                  ? (accountMode === 'customer' ? 'Register as customer' : 'Register your branch')
                  : (accountMode === 'customer' ? 'Customer sign in' : 'Sign in to QueueLess')}
              </h2>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6" noValidate>
              {/* Google OAuth — customer login only */}
              {accountMode === 'customer' && !isRegister && (
                <>
                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/oauth2/authorization/google`}
                    className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                  </a>
                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="flex-shrink-0 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">or</span>
                    <div className="flex-grow border-t border-slate-200" />
                  </div>
                </>
              )}

              {/* Name field (register only) */}
              {isRegister && (
                <div>
                  <label htmlFor="auth-name" className="ql-label">Full name <span className="text-red-500">*</span></label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    aria-required="true"
                    aria-describedby={nameError ? 'auth-name-error' : undefined}
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (touched.name && e.target.value.trim()) setTouched((t) => ({ ...t, name: true })); }}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    className={`ql-field ${nameError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Aarav Shah"
                    autoComplete="name"
                  />
                  <FieldError message={nameError} id="auth-name-error" />
                </div>
              )}

              {/* Phone field */}
              <div>
                <label htmlFor="auth-phone" className="ql-label">Mobile number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-slate-400">+91</span>
                  <input
                    ref={phoneRef}
                    id="auth-phone"
                    type="tel"
                    inputMode="tel"
                    required
                    aria-required="true"
                    aria-describedby={phoneError ? 'auth-phone-error' : undefined}
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    className={`ql-field pl-11 ${phoneError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="9876543210"
                    autoComplete="tel"
                  />
                </div>
                <FieldError message={phoneError} id="auth-phone-error" />
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="auth-password" className="ql-label">
                  Password {(isRegister || accountMode === 'business') && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required={isRegister || accountMode === 'business'}
                    aria-required={isRegister || accountMode === 'business' ? 'true' : undefined}
                    aria-describedby={passwordError ? 'auth-password-error' : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    className={`ql-field pr-10 ${passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder={accountMode === 'customer' && !isRegister ? 'Password or use OTP below' : 'At least 8 characters'}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FieldError message={passwordError} id="auth-password-error" />
              </div>

              {/* Confirm password (register only) */}
              {isRegister && (
                <div>
                  <label htmlFor="auth-confirm-password" className="ql-label">Confirm password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      aria-required="true"
                      aria-describedby={confirmError ? 'auth-confirm-error' : undefined}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                      className={`ql-field pr-10 ${confirmError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-600"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <FieldError message={confirmError} id="auth-confirm-error" />
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="ql-btn-primary w-full gap-2 py-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isRegister ? 'Creating account...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    {isRegister ? 'Create account' : 'Sign in'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* OTP section — customer login only */}
              {!isRegister && accountMode === 'customer' && (
                <div className="rounded-md border border-slate-200 bg-slate-50/80 p-4">
                  <div className="mb-2.5 flex items-center gap-2">
                    <Smartphone size={14} className="text-slate-500" />
                    <span className="text-[12px] font-bold text-slate-600">Passwordless login with OTP</span>
                  </div>
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <button
                      type="button"
                      className="ql-btn-secondary shrink-0 text-[12px] sm:w-32"
                      onClick={requestOtp}
                      disabled={otpLoading || resendTimer > 0}
                    >
                      {otpLoading && !otpSent ? (
                        <><Loader2 size={14} className="animate-spin" /> Sending...</>
                      ) : resendTimer > 0 ? (
                        `Resend (${resendTimer}s)`
                      ) : otpSent ? (
                        'Resend OTP'
                      ) : (
                        'Send OTP'
                      )}
                    </button>
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="ql-field text-center font-mono tracking-[0.3em]"
                      inputMode="numeric"
                      placeholder="• • • • • •"
                      maxLength={6}
                      disabled={!otpSent}
                      aria-label="6-digit OTP code"
                    />
                    <button
                      type="button"
                      className="ql-btn-primary shrink-0 text-[12px] sm:w-28"
                      onClick={verifyOtp}
                      disabled={otpLoading || !otpSent || otp.length !== 6}
                    >
                      {otpLoading && otpSent ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-center text-[13px] text-slate-600 sm:px-6">
              {isRegister ? (
                <>Already have an account? <Link to={`/login${accountMode === 'customer' ? '?account=customer' : ''}`} className="font-semibold text-slate-900 hover:underline">Sign in</Link></>
              ) : (
                <>No account? <Link to={`/register${accountMode === 'customer' ? '?account=customer' : ''}`} className="font-semibold text-slate-900 hover:underline">{accountMode === 'customer' ? 'Create customer account' : 'Register your shop'}</Link></>
              )}
            </div>
          </div>

          {/* Terms notice */}
          <p className="mt-4 text-center text-[11px] text-slate-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </section>
      </div>
    </div>
  );
}
