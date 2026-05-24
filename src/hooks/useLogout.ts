import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear local auth even if the backend token is already invalid.
    } finally {
      clearAuth();
      toast.success('Signed out successfully');
      navigate('/login', { replace: true });
    }
  }, [clearAuth, navigate]);
}
