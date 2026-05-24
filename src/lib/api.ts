// src/lib/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8080`;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ——— Request interceptor: attach Bearer token ———
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ——— Response interceptor: handle 401, refresh tokens ———
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        useAuthStore.getState().clearAuth();
        const isCustomer = window.location.pathname.startsWith('/customer');
        window.location.href = isCustomer ? '/login?account=customer' : '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken ?? refreshToken);
        useAuthStore.setState((state) => ({
          user: data.user ?? state.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken ?? refreshToken,
          isAuthenticated: true,
        }));
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        // Hard redirect as a fail-safe if the React component doesn't catch the state change
        const isCustomer = window.location.pathname.startsWith('/customer');
        window.location.href = isCustomer ? '/login?account=customer' : '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ——— Automatic retry for network errors (GET/PUT only — never POST/DELETE) ———
    const retryable = originalRequest as InternalAxiosRequestConfig & { _retryCount?: number };
    const method = (originalRequest.method ?? '').toUpperCase();
    const isNetworkError = !error.response; // no response = network/timeout
    const isSafeMethod = method === 'GET' || method === 'PUT';

    if (isNetworkError && isSafeMethod) {
      retryable._retryCount = (retryable._retryCount ?? 0) + 1;
      if (retryable._retryCount <= 3) {
        const delay = Math.pow(2, retryable._retryCount - 1) * 500; // 500ms, 1s, 2s
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(retryable);
      }
    }

    return Promise.reject(error);
  }
);

// ——— API methods ———

export const authApi = {
  register: (data: unknown) => api.post('/api/auth/register', data),
  login: (data: unknown) => api.post('/api/auth/login', data),
  requestOtp: (phone: string) => api.post('/api/auth/otp/request', { phone }),
  verifyOtp: (phone: string, otp: string) => api.post('/api/auth/otp/verify', { phone, otp }),
  refresh: (refreshToken: string) => api.post('/api/auth/refresh', { refreshToken }),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
};

export const shopApi = {
  getAccessibleShops: () => api.get('/api/shops/my'),
  create: (data: unknown) => api.post('/api/owner/shops', data),
  getMyShops: () => api.get('/api/owner/shops'),
  update: (id: string, data: unknown) => api.put(`/api/owner/shops/${id}`, data),
  getById: (id: string) => api.get(`/api/shops/public/${id}`),
  getNearby: (lat: number, lng: number, radius = 5) =>
    api.get(`/api/shops/public/nearby?lat=${lat}&lng=${lng}&radiusKm=${radius}`),
  searchPublic: (query: string) => api.get(`/api/shops/public/search?q=${encodeURIComponent(query)}`),
  getPopular: (category = 'ALL', lat?: number, lng?: number, limit = 12) =>
    api.get('/api/shops/public/popular', { params: { category, lat, lng, limit } }),
  getTrending: (category = 'ALL', lat?: number, lng?: number, limit = 12) =>
    api.get('/api/shops/public/trending', { params: { category, lat, lng, limit } }),
  pauseQueue: (id: string) => api.post(`/api/owner/shops/${id}/pause`),
  resumeQueue: (id: string) => api.post(`/api/owner/shops/${id}/resume`),
  clone: (id: string, data: { newName: string; newAddress: string; branchCode: string }) => 
    api.post(`/api/owner/shops/${id}/clone`, data),
  getQrPoster: (id: string) => api.get(`/api/owner/shops/${id}/qr-poster`),
  getStats: (id: string) => api.get(`/api/owner/shops/${id}/stats`),
  getServices: (id: string) => api.get(`/api/shops/public/${id}/services`),
  addService: (shopId: string, data: unknown) => api.post(`/api/owner/shops/${shopId}/services`, data),
  deleteService: (serviceId: string) => api.delete(`/api/owner/services/${serviceId}`),
  getBySlug: (slug: string) => api.get(`/api/shops/public/slug/${slug}`),
  getStatus: (id: string) => api.get(`/api/shops/public/${id}/status`),
  updateIncident: (id: string, data: { status: string; message: string }) => 
    api.put(`/api/owner/shops/${id}/incident`, data),
};





export const providerApi = {
  create: (shopId: string, data: unknown) => api.post(`/api/shops/${shopId}/providers`, data),
  getByShop: (shopId: string) => api.get(`/api/shops/${shopId}/providers`),
  delete: (shopId: string, providerId: string) => api.delete(`/api/shops/${shopId}/providers/${providerId}`),
  updateAvailability: (shopId: string, providerId: string, available: boolean) =>
    api.patch(`/api/shops/${shopId}/providers/${providerId}/availability`, { available }),
  updateMyAvailability: (shopId: string, available: boolean) =>
    api.patch(`/api/shops/${shopId}/providers/me/availability`, { available }),
};

export const tokenApi = {
  getToken: (data: unknown) => api.post('/api/tokens', data),
  createWalkIn: (data: unknown) => api.post('/api/tokens/walk-in', data),
  callNext: (shopId: string) => api.post(`/api/tokens/shops/${shopId}/call-next`),
  skip: (tokenId: string, data?: unknown) => api.post(`/api/tokens/${tokenId}/skip`, data),
  snooze: (tokenId: string) => api.post(`/api/tokens/${tokenId}/snooze`),
  rejoin: (tokenId: string) => api.post(`/api/tokens/${tokenId}/rejoin`),
  cancel: (tokenId: string, data?: unknown) => api.post(`/api/tokens/${tokenId}/cancel`, data),
  markArrived: (tokenId: string) => api.post(`/api/tokens/${tokenId}/arrived`),
  markServing: (tokenId: string) => api.post(`/api/tokens/${tokenId}/serving`),
  complete: (tokenId: string) => api.post(`/api/tokens/${tokenId}/complete`),
  clearQueue: (shopId: string, reason?: string) => api.post(`/api/tokens/shops/${shopId}/clear`, { reason }),
  getLiveQueue: (shopId: string) => api.get(`/api/tokens/shops/${shopId}/queue`),
  getOperatorLiveQueue: (shopId: string) => api.get(`/api/tokens/shops/${shopId}/queue/operator`),
  getMyHistory: (page = 0, size = 20) =>
    api.get(`/api/tokens/my-history?page=${page}&size=${size}`),
  transfer: (tokenId: string, data: unknown) => api.post(`/api/tokens/${tokenId}/transfer`, data),
};

export const businessAccountApi = {
  getSettings: () => api.get('/api/owner/business-accounts'),
  updateSettings: (data: any) => api.put('/api/owner/business-accounts/me', data),
  create: (data: unknown) => api.post('/api/owner/business-accounts', data),
  getMine: () => api.get('/api/owner/business-accounts'),
  update: (accountId: string, data: unknown) => api.put(`/api/owner/business-accounts/${accountId}`, data),
};

export const appointmentApi = {
  book: (data: unknown) => api.post('/api/appointments', data),
  verifyPayment: (id: string, data: unknown) => api.post(`/api/appointments/${id}/verify-payment`, data),
  reschedule: (id: string, data: unknown) => api.patch(`/api/appointments/${id}/reschedule`, data),
  cancel: (id: string, reason?: string) =>
    api.delete(`/api/appointments/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`),
  getMy: (page = 0, size = 20) => api.get(`/api/appointments/my?page=${page}&size=${size}`),
  getByShop: (shopId: string, page = 0, size = 20) => api.get(`/api/appointments/shop/${shopId}?page=${page}&size=${size}`),
  complete: (id: string) => api.post(`/api/appointments/${id}/complete`),
};

export const loyaltyApi = {
  getMyLoyalty: (shopId: string) => api.get(`/api/loyalty/shop/${shopId}`),
  getConfig: (shopId: string) => api.get(`/api/loyalty/owner/shop/${shopId}/config`),
  updateConfig: (shopId: string, data: unknown) => api.put(`/api/loyalty/owner/shop/${shopId}/config`, data),
};

export const attachmentApi = {
  upload: (file: File, targetId: string, targetType: 'TOKEN' | 'APPOINTMENT') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetId', targetId);
    formData.append('targetType', targetType);
    return api.post('/api/attachments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  add: (data: unknown) => api.post('/api/attachments', data),
  getByEntity: (entityId: string, entityType: string) =>
    entityType.toUpperCase() === 'TOKEN'
      ? api.get(`/api/attachments/token/${entityId}`)
      : api.get(`/api/attachments/appointment/${entityId}`),
  getTokenAttachments: (tokenId: string) => api.get(`/api/attachments/token/${tokenId}`),
  getAppointmentAttachments: (appointmentId: string) => api.get(`/api/attachments/appointment/${appointmentId}`),
};

export const shopStatusApi = {
  getStatus: (shopId: string) => api.get(`/api/shops/public/${shopId}/status`),
  getHolidays: (shopId: string) => api.get(`/api/shops/public/${shopId}/holidays`),
  addHoliday: (shopId: string, data: unknown) => api.post(`/api/owner/shops/${shopId}/holidays`, data),
  deleteHoliday: (holidayId: string) => api.delete(`/api/owner/holidays/${holidayId}`),
  getAnalytics: (shopId: string, days = 7) => api.get(`/api/owner/shops/${shopId}/analytics?days=${days}`),
  getShopAnalytics: (shopId: string, days = 30) => api.get(`/api/owner/shops/${shopId}/analytics?days=${days}`), // Unified with owner path
};

export const announcementApi = {
  getActive: (shopId: string) => api.get(`/api/shops/public/${shopId}/announcements`),
  getAll: (shopId: string) => api.get(`/api/owner/shops/${shopId}/announcements`),
  create: (shopId: string, data: unknown) => api.post(`/api/owner/shops/${shopId}/announcements`, data),
  delete: (announcementId: string) => api.delete(`/api/owner/announcements/${announcementId}`),
};

export const reviewApi = {
  create: (data: unknown) => api.post('/api/reviews', data),
  getByShop: (shopId: string, page = 0, size = 20) =>
    api.get(`/api/reviews/shops/${shopId}?page=${page}&size=${size}`),
  getOwnerByShop: (shopId: string, page = 0, size = 50) =>
    api.get(`/api/reviews/owner/shops/${shopId}?page=${page}&size=${size}`),
  getSummary: (shopId: string) => api.get(`/api/reviews/shops/${shopId}/summary`),
  getOwnerSummary: (shopId: string) => api.get(`/api/reviews/owner/shops/${shopId}/summary`),
};

export const analyticsApi = {
  getShopAnalytics: (shopId: string, days = 30) =>
    api.get(`/api/analytics/shop/${shopId}?days=${days}`),
};

export const waitlistApi = {
  join: (data: unknown) => api.post('/api/waitlist', data),
  leave: (waitlistId: string) => api.delete(`/api/waitlist/${waitlistId}`),
  getMy: () => api.get('/api/waitlist/my'),
};

export const tokenApiExtended = {
  setPriority: (tokenId: string, priority: string) =>
    api.post(`/api/tokens/${tokenId}/priority`, { priority }),
};

export const profileApi = {
  get: () => api.get('/api/users/profile'),
  update: (data: { name: string; email?: string }) => api.put('/api/users/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/api/users/profile/password', data),
  deleteAccount: () => api.delete('/api/users/profile'),
};

export const mediaApi = {
  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post<{ url: string }>('/api/media/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  removeAvatar: () => api.delete('/api/media/avatar'),
  uploadShopLogo: (shopId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post<{ url: string }>(`/api/media/shops/${shopId}/logo`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  removeShopLogo: (shopId: string) => api.delete(`/api/media/shops/${shopId}/logo`),
};

export const adminModerationApi = {
  getPendingShops: () => api.get('/api/admin/moderation/shops/pending'),
  getFlaggedReviews: () => api.get('/api/admin/moderation/reviews/flagged'),
  verifyShop: (shopId: string, status: string, active?: boolean) =>
    api.patch(`/api/admin/moderation/shops/${shopId}/verification`, null, { params: { status, active } }),
  moderateReview: (reviewId: string, data: { status: string; reason: string }) =>
    api.patch(`/api/admin/moderation/reviews/${reviewId}`, data),
};

export const staffPresenceApi = {
  heartbeat: (shopId: string, data: unknown) =>
    api.post(`/api/shops/${shopId}/staff-presence/heartbeat`, data),
  getByShop: (shopId: string) => 
    api.get(`/api/shops/${shopId}/staff-presence`),
};

export const subscriptionApi = {
  getCurrent: (shopId: string) => api.get(`/api/owner/shops/${shopId}/subscription`),
  update: (shopId: string, plan: string) =>
    api.put(`/api/owner/shops/${shopId}/subscription`, { plan }),
};
