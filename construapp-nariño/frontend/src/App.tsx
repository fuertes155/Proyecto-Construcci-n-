import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import AdminRoute from '@components/AdminRoute';
import Layout from '@components/Layout';
import ProtectedRoute from '@components/ProtectedRoute';
import { AuthProvider } from '@context/AuthContext';
import AdminLayout from '@pages/Admin/AdminLayout';
import AdminMaterials from '@pages/Admin/Materials';
import AdminPrices from '@pages/Admin/Prices';
import AdminProviders from '@pages/Admin/Providers';
import AdminUsers from '@pages/Admin/Users';
import ForgotPassword from '@pages/Auth/ForgotPassword';
import Login from '@pages/Auth/Login';
import Register from '@pages/Auth/Register';
import ResetPassword from '@pages/Auth/ResetPassword';
import Calculators from '@pages/Calculators';
import Dashboard from '@pages/Dashboard';
import Home from '@pages/Home';
import NotFound from '@pages/NotFound';
import ProjectDetail from '@pages/ProjectDetail';
import ProviderDetail from '@pages/ProviderDetail';
import Projects from '@pages/Projects';
import Providers from '@pages/Providers';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

/** Al cambiar de página, vuelve al inicio (el router no lo hace por sí solo). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Con navegación: calculadoras (HU-02.10) y proveedores (EP-04) son públicas; el resto exige sesión */}
            <Route element={<Layout />}>
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/providers/:providerId" element={<ProviderDetail />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:projectId" element={<ProjectDetail />} />
              </Route>
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/materials" replace />} />
                  <Route path="materials" element={<AdminMaterials />} />
                  <Route path="prices" element={<AdminPrices />} />
                  <Route path="providers" element={<AdminProviders />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* Abajo a la derecha, lejos de la navegación: un toast encima de un botón
              bloquea sus clics mientras está visible (~4 s). En móvil se eleva por
              encima de la barra inferior por la misma razón. */}
          <Toaster
            position="bottom-right"
            containerClassName="!bottom-24 lg:!bottom-6 lg:!right-6"
            toastOptions={{
              style: {
                background: 'rgb(var(--surface))',
                color: 'rgb(var(--ink))',
                border: '1px solid rgb(var(--line))',
                borderRadius: '0.625rem',
                boxShadow:
                  '0 8px 20px -8px rgb(var(--shadow) / 0.18), 0 2px 6px -2px rgb(var(--shadow) / 0.08)',
                padding: '0.625rem 0.875rem',
                fontSize: '0.9375rem',
                fontWeight: 500,
                maxWidth: '24rem',
              },
              success: {
                iconTheme: { primary: 'rgb(var(--success))', secondary: 'rgb(var(--surface))' },
              },
              error: {
                iconTheme: { primary: 'rgb(var(--danger))', secondary: 'rgb(var(--surface))' },
              },
            }}
          />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
