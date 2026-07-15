import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg }}>
        <LoadingSpinner t={t} size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
