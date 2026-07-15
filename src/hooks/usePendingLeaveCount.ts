import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { LeaveRecord } from '../types/domain';

export function usePendingLeaveCount() {
  const { data } = useQuery({
    queryKey: ['leave-records', 'pending-count'],
    queryFn: () => apiGet<LeaveRecord[]>('/api/leave-records', { status: 'PendingApproval' }),
    staleTime: 30_000,
  });
  return data?.length ?? 0;
}
