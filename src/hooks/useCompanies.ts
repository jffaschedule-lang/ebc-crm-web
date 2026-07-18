import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { Company } from '../types/domain';

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => apiGet<Company[]>('/api/companies'),
  });
}
