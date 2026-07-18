import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '../api/client';
import { Company } from '../types/domain';

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => apiGet<Company[]>('/api/companies'),
  });
}

export interface CompanyInput {
  code: string;
  station: string;
  district?: 120 | 140 | 160 | null;
  suffix_rule?: string | null;
  records_only?: boolean;
  station_override?: string | null;
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompanyInput) => apiPost<Company>('/api/companies', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, changes }: { code: string; changes: Partial<CompanyInput> }) =>
      apiPatch<Company>(`/api/companies/${code}`, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
}
