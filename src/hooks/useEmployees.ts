import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch, apiPost } from '../api/client';
import { Employee, EmployeeStatus, Platoon, Rank } from '../types/domain';

export interface EmployeeInput {
  emp_number: number;
  last_name: string;
  first_name: string;
  middle_initial?: string | null;
  rank: Rank;
  platoon: Platoon;
  company_code: string;
  supervisor?: boolean;
  status?: EmployeeStatus;
  email?: string | null;
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeInput) => apiPost<Employee>('/api/employees', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<EmployeeInput> }) =>
      apiPatch<Employee>(`/api/employees/${id}`, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useSetEmployeeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EmployeeStatus }) =>
      apiPatch<Employee>(`/api/employees/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
