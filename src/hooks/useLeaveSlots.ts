import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../api/client';
import { AlSlotLedger, LeaveRecord } from '../types/domain';

export function useLeaveSlots(platoon: string, dateStr: string) {
  return useQuery({
    queryKey: ['slots', platoon, dateStr],
    queryFn: () => apiGet<AlSlotLedger>(`/api/leave/slots/${platoon}/${dateStr}`),
    enabled: Boolean(platoon) && Boolean(dateStr),
  });
}

export interface SubmitLeavePayload {
  employee_id: string;
  leave_type: string;
  shift_date: string;
  span_start: string;
  span_end: string;
  reason?: string;
  sl_illness?: boolean;
  sl_medical?: boolean;
  sl_dental?: boolean;
  sl_optical?: boolean;
  sl_death?: boolean;
}

export function useSubmitLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitLeavePayload) => apiPost<LeaveRecord>('/api/leave', payload),
    onSuccess: () => {
      // Partial key match invalidates every ['slots', platoon, date] query —
      // the mutation doesn't know the employee's platoon at this point.
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['leave-records'] });
    },
  });
}
