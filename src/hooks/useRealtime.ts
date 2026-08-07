import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

// Bulk operations (e.g. "Generate Today's Duty Ledger" for ~80 employees at
// once) fire one postgres_changes event PER ROW. Without debouncing, that
// used to trigger 80 separate refetches in a couple of seconds and could trip
// the backend's rate limiter (see src/middleware/rateLimiter.ts on the API),
// which then made even unrelated calls like /api/auth/me fail. Collapsing
// bursts of events within this window into a single refetch fixes both the
// wasted network traffic and the rate-limit lockout.
const DEBOUNCE_MS = 500;

/**
 * Subscribes to Supabase Realtime for duty_ledger and leave_records changes
 * and invalidates the corresponding TanStack Query caches so the duty board
 * and leave screens auto-refresh.
 */
export function useRealtime() {
  const queryClient = useQueryClient();
  const dutyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const dutyChannel = supabase
      .channel('duty_ledger_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'duty_ledger' },
        () => {
          if (dutyTimer.current) clearTimeout(dutyTimer.current);
          dutyTimer.current = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['duty-ledger'] });
            queryClient.invalidateQueries({ queryKey: ['workforce'] });
          }, DEBOUNCE_MS);
        }
      )
      .subscribe();

    const leaveChannel = supabase
      .channel('leave_records_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leave_records' },
        () => {
          if (leaveTimer.current) clearTimeout(leaveTimer.current);
          leaveTimer.current = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['leave-records'] });
            queryClient.invalidateQueries({ queryKey: ['slots'] });
          }, DEBOUNCE_MS);
        }
      )
      .subscribe();

    return () => {
      if (dutyTimer.current) clearTimeout(dutyTimer.current);
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      supabase.removeChannel(dutyChannel);
      supabase.removeChannel(leaveChannel);
    };
  }, [queryClient]);
}
