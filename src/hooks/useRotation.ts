import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { RotationDay } from '../types/domain';

export function useRotation(dateStr: string) {
  return useQuery({
    queryKey: ['rotation', dateStr],
    queryFn: () => apiGet<RotationDay>(`/api/rotation/date/${dateStr}`),
    enabled: Boolean(dateStr),
  });
}

export function useRotationPeriod(ppEnd: string) {
  return useQuery({
    queryKey: ['rotation-period', ppEnd],
    queryFn: () => apiGet<RotationDay[]>(`/api/rotation/period/${ppEnd}`),
    enabled: Boolean(ppEnd),
  });
}
