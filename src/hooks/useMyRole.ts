import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { AppRole } from '../types/domain';
import { useAuth } from '../auth/useAuth';

interface Me {
  employeeId: string | null;
  roles: AppRole[];
}

/** Current user's app roles (admin/supervisor/member), for gating supervisor-only UI. */
export function useMyRole() {
  const { session } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiGet<Me>('/api/auth/me'),
    enabled: Boolean(session),
  });

  const roles = data?.roles ?? [];
  const isSupervisorOrAdmin = roles.includes('supervisor') || roles.includes('admin');

  return { roles, isSupervisorOrAdmin, isLoading };
}
