import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

/**
 * Subscribes to Supabase Realtime for duty_ledger and leave_records changes
 * and invalidates the corresponding TanStack Query caches so the duty board
 * and leave screens auto-refresh.
 */
export function useRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const dutyChannel = supabase
      .channel('duty_ledger_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'duty_ledger' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['duty-ledger'] });
          queryClient.invalidateQueries({ queryKey: ['workforce'] });
        }
      )
      .subscribe();

    const leaveChannel = supabase
      .channel('leave_records_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leave_records' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['leave-records'] });
          queryClient.invalidateQueries({ queryKey: ['slots'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dutyChannel);
      supabase.removeChannel(leaveChannel);
    };
  }, [queryClient]);
}
