import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client';
import {
  AdminAuthUser,
  AppRole,
  NotificationRule,
  RoleAssignment,
  SystemInfo,
} from '../types/domain';

export function useBootstrapStatus() {
  return useQuery({
    queryKey: ['admin', 'bootstrap-status'],
    queryFn: () => apiGet<{ adminExists: boolean }>('/api/admin/bootstrap-status'),
  });
}

export function useAdminUsers(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiGet<AdminAuthUser[]>('/api/admin/users'),
    enabled,
  });
}

export function useAdminRoles(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => apiGet<RoleAssignment[]>('/api/admin/roles'),
    enabled,
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { employee_id: string; role: AppRole }) =>
      apiPost<RoleAssignment>('/api/admin/roles', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<{ removed: boolean }>(`/api/admin/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useSetupFirstAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) =>
      apiPost<{ employeeId: string; roles: AppRole[] }>('/api/admin/setup-first-admin', { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });
}

export function useSystemInfo(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'system-info'],
    queryFn: () => apiGet<SystemInfo>('/api/admin/system-info'),
    enabled,
  });
}

export function useNotificationRules(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'notification-rules'],
    queryFn: () => apiGet<NotificationRule[]>('/api/admin/notification-rules'),
    enabled,
  });
}

export function useUpdateNotificationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ event, changes }: { event: string; changes: Partial<Pick<NotificationRule, 'enabled' | 'recipients'>> }) =>
      apiPatch<NotificationRule>(`/api/admin/notification-rules/${event}`, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notification-rules'] }),
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: (to: string) => apiPost<{ sent: boolean }>('/api/admin/test-email', { to }),
  });
}
