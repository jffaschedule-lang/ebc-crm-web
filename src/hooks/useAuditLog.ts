import { useInfiniteQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { AuditLogEntry } from '../types/domain';

const PAGE_LIMIT = 50;

export function useAuditLog() {
  return useInfiniteQuery({
    queryKey: ['audit-log'],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      apiGet<AuditLogEntry[]>('/api/audit', { limit: PAGE_LIMIT, before: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === PAGE_LIMIT ? lastPage[lastPage.length - 1]?.occurred_at : undefined,
  });
}
