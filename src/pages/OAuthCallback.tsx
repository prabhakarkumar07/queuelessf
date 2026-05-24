import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

function destinationFor(user: User) {
  if (user.role === 'CUSTOMER') return '/customer';
  if (user.role === 'SERVICE_PROVIDER') return '/staff';
  return '/dashboard';
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    const finish = async () => {
      const accessToken = params.get('token');
      const refreshToken = params.get('refreshToken');

      if (!accessToken || !refreshToken) {
        toast.error('Google sign in did not return a valid session');
        navigate('/login?account=customer', { replace: true });
        return;
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      try {
        const { data: user } = await authApi.me();
        setAuth(user, accessToken, refreshToken);
        toast.success(`Welcome back, ${user.name}`);
        navigate(destinationFor(user), { replace: true });
      } catch {
        setMessage('Could not load your profile. Please try again.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        toast.error('Google sign in failed');
        navigate('/login?account=customer', { replace: true });
      }
    };

    void finish();
  }, [navigate, params, setAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-md border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-900">{message}</p>
        <p className="mt-1 text-xs text-slate-500">This usually takes a moment.</p>
      </div>
    </div>
  );
}
