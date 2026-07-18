import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '../api/client';
import { DutyLedgerRow } from '../types/domain';

export function useGenerateDutyLedger() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => apiPost<DutyLedgerRow[]>('/api/duty-ledger/generate', { date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duty-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['workforce'] });
    },
  });
}
