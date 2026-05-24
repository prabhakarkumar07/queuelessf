import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { authApi } from './lib/api';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import LandingPage from './pages/landing/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import TvDisplay from './pages/TvDisplay';
import Services from './pages/Services';
import CreateShop from './pages/CreateShop';
import StaffManagement from './pages/StaffManagement';
import StaffView from './pages/StaffView';
import LoyaltySettings from './pages/LoyaltySettings';
import Announcements from './pages/Announcements';
import Holidays from './pages/Holidays';
import Reviews from './pages/Reviews';
import Analytics from './pages/Analytics';
import AttachmentViewer from './pages/AttachmentViewer';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';
import CustomerPortal from './pages/CustomerPortal';
import Profile from './pages/Profile';
import PublicShopPage from './pages/PublicShopPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminShops from './pages/AdminShops';
import AdminShopDetails from './pages/AdminShopDetails';
import AdminCustomers from './pages/AdminCustomers';
import AdminSupport from './pages/AdminSupport';
import AdminBilling from './pages/AdminBilling';
import AdminOps from './pages/AdminOps';
import QrPoster from './pages/QrPoster';
import Subscription from './pages/Subscription';
import Settings from './pages/Settings';
import OAuthCallback from './pages/OAuthCallback';
import { AboutPage, PrivacyPage, TermsPage, RefundPage, ContactPage, BlogPage, CareersPage } from './pages/LegalPages';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireOwner({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'SERVICE_PROVIDER') return <Navigate to="/staff" replace />;
  if (user.role !== 'SHOP_OWNER' && user.role !== 'ADMIN') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireCustomer({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login?account=customer" replace />;
  if (user.role !== 'CUSTOMER') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RequireStaff({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!['SHOP_OWNER', 'ADMIN', 'SERVICE_PROVIDER'].includes(user.role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireInternalAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  const internalRoles = ['SUPER_ADMIN', 'OPS_ADMIN', 'SUPPORT_AGENT', 'FINANCE_ADMIN', 'ADMIN'];
  if (!internalRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}


export default function App() {
  const { isAuthenticated, clearAuth } = useAuthStore();
  const [verifying, setVerifying] = useState(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      const checkSession = async () => {
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session verification timeout')), 5000)
        );
        try {
          // Attempt to fetch current user to verify token, with timeout
          await Promise.race([authApi.me(), timeout]);
        } catch (err) {
          console.warn("Session check failed or timed out:", err);
          // If 401 or network error, clear the ghost session
          // Only clear if it's a 401 (not just a timeout/network blip if we want to be more lenient, 
          // but audit says "fail fast/use cached state"). 
          // Actually, if it times out, we just unblock the UI and let the next API call handle it.
          if ((err as any)?.response?.status === 401) {
            clearAuth();
          }
        } finally {
          setVerifying(false);
        }
      };
      checkSession();
    }
  }, []);

  if (verifying) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm font-bold text-slate-500">Securing session...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1c1917',
              color: '#fafaf9',
              border: '1px solid #44403c',
              borderRadius: '8px',
              boxShadow: '0 18px 45px rgba(28, 25, 23, 0.18)',
              fontSize: '13px',
              fontWeight: 600,
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth2/callback" element={<OAuthCallback />} />
          <Route path="/tv/:shopId" element={<TvDisplay />} />
          <Route path="/shop/:slug" element={<PublicShopPage />} />
          <Route
            path="/customer"
            element={
              <RequireAuth>
                <RequireCustomer>
                  <CustomerPortal />
                </RequireCustomer>
              </RequireAuth>
            }
          />

          {/* Staff-only focused view */}
          <Route
            path="/staff"
            element={
              <RequireStaff>
                <StaffView />
              </RequireStaff>
            }
          />

          {/* Internal Company Admin Panel */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireInternalAdmin>
                  <AdminLayout />
                </RequireInternalAdmin>
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="shops" element={<AdminShops />} />
            <Route path="shops/:id" element={<AdminShopDetails />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="billing" element={<AdminBilling />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="ops" element={<AdminOps />} />
          </Route>

          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <RequireOwner>
                  <DashboardLayout />
                </RequireOwner>
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="shops/new" element={<CreateShop />} />
            <Route path="services" element={<Services />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="loyalty" element={<LoyaltySettings />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="holidays" element={<Holidays />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="poster" element={<QrPoster />} />
            <Route path="setup" element={<Onboarding />} />
            <Route path="business" element={<Settings />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="attachments/:entityType/:entityId" element={<AttachmentViewer />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Legal & Company */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/refund" element={<RefundPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/careers" element={<CareersPage />} />

          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
