import { Navigate, Outlet } from 'react-router-dom';
import { useMyRole } from '../hooks/useMyRole';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

/** Sends a logged-in user with zero assigned roles to /setup instead of the normal app. */
export function RoleGate() {
  const { roles, isLoading } = useMyRole();
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg }}>
        <LoadingSpinner t={t} size={32} />
      </div>
    );
  }

  if (roles.length === 0) {
    return <Navigate to="/setup" replace />;
  }

  return <Outlet />;
}
