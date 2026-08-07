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
  const isAdmin = roles.includes('admin');
  const isSupervisorOrAdmin = roles.includes('supervisor') || isAdmin;

  // The employee record's id — NOT the same as the Supabase Auth user id
  // (session.user.id). Anything writing to a table with an employee_id
  // foreign key (e.g. ot_availability) must use this value, not auth.user.id.
  return { roles, isAdmin, isSupervisorOrAdmin, isLoading, employeeId: data?.employeeId ?? null };
}
