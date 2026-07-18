import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint, isMobile, isTablet } from '../hooks/useBreakpoint';
import { MIN_TAP_TARGET } from '../theme/spacing';
import { apiGet, apiPatch } from '../api/client';
import { LeaveRecord } from '../types/domain';
import { useLeaveSlots } from '../hooks/useLeaveSlots';
import { MetricCard } from '../components/ui/MetricCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { RTable, RTableColumn } from '../components/ui/RTable';
import { MobileList } from '../components/ui/MobileList';
import { StatusChip } from '../components/ui/StatusChip';
import { Card } from '../components/ui/Card';
import { SlotBar } from '../components/ui/SlotBar';

export default function LeaveRecords() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const tablet = isTablet(bp);
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['leave-records', statusFilter, dateFilter],
    queryFn: () =>
      apiGet<LeaveRecord[]>('/api/leave-records', {
        status: statusFilter || undefined,
        shift_date: dateFilter || undefined,
      }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Granted' | 'Cancelled' | 'Deleted' }) =>
      apiPatch(`/api/leave-records/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-records'] }),
  });

  const records = data ?? [];
  const pending = records.filter((r) => r.status === 'PendingApproval');
  const granted = records.filter((r) => r.status === 'Granted' || r.status === 'Active');
  const waitlist = records.filter((r) => r.status === 'Waitlist');
  const firstWaitlisted = waitlist[0];

  const { data: slotLedger } = useLeaveSlots(
    firstWaitlisted?.employees?.platoon ?? '',
    firstWaitlisted?.shift_date ?? ''
  );

  const cols: RTableColumn<LeaveRecord>[] = [
    { key: 'entry_id', header: 'Entry ID', render: (r) => r.entry_id, hideAt: ['md'] },
    { key: 'type', header: 'Type', render: (r) => r.leave_type },
    { key: 'date', header: 'Shift Date', render: (r) => r.shift_date },
    { key: 'span', header: 'Span', render: (r) => `${r.span_start}–${r.span_end}`, hideAt: ['md', 'lg'] },
    { key: 'status', header: 'Status', render: (r) => <StatusChip t={t} status={r.status} /> },
    {
      key: 'actions',
      header: '',
      render: (r) =>
        r.status === 'PendingApproval' || r.status === 'Waitlist' ? (
          <button
            type="button"
            onClick={() => updateStatus.mutate({ id: r.id, status: 'Granted' })}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              background: t.ok,
              color: '#fff',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Approve
          </button>
        ) : null,
    },
  ];

  const hasFilters = Boolean(statusFilter || dateFilter);

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr 1fr' : tablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <MetricCard t={t} label="Pending" value={pending.length} />
        <MetricCard t={t} label="Granted" value={granted.length} />
        <MetricCard t={t} label="Waitlist" value={waitlist.length} />
        <MetricCard t={t} label="Total" value={records.length} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 10px',
            minHeight: mobile ? MIN_TAP_TARGET : undefined,
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
            flex: mobile ? '1 1 100%' : undefined,
          }}
        >
          <option value="">All statuses</option>
          {['PendingApproval', 'Granted', 'Active', 'Waitlist', 'Promoted', 'Cancelled', 'Deleted'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            padding: '8px 10px',
            minHeight: mobile ? MIN_TAP_TARGET : undefined,
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
            flex: mobile ? '1 1 100%' : undefined,
          }}
        />
      </div>

      {isLoading && <LoadingSpinner t={t} size={32} />}
      {error && <AlertBar t={t} type="crit">Couldn't load leave records. Check your connection and reload.</AlertBar>}

      {!isLoading && !error && (
        mobile ? (
          <MobileList
            t={t}
            rows={records}
            rowKey={(r) => r.id}
            emptyMessage={hasFilters ? 'No leave records match these filters.' : 'No leave requests pending.'}
            renderItem={(r) => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: t.text }}>{r.leave_type} · {r.shift_date}</span>
                  <StatusChip t={t} status={r.status} />
                </div>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4, fontFamily: 'ui-monospace, SF Mono, Consolas, monospace' }}>
                  {r.span_start}–{r.span_end}
                </div>
              </div>
            )}
          />
        ) : (
          <RTable
            t={t}
            bp={bp}
            cols={cols}
            rows={records}
            rowKey={(r) => r.id}
            emptyMessage={hasFilters ? 'No leave records match these filters.' : 'No leave requests pending.'}
          />
        )
      )}

      {waitlist.length > 0 && (
        <Card t={t} style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Waitlist (FIFO order)</h3>
          {slotLedger && (
            <div style={{ marginBottom: 12 }}>
              <SlotBar t={t} occupied={slotLedger.peak_concurrent} maxSlots={slotLedger.max_slots} />
            </div>
          )}
          {waitlist.map((r) => (
            <div
              key={r.id}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: `1px solid ${t.border}` }}
            >
              <span style={{ fontSize: 13, color: t.text, flex: 1 }}>
                {r.entry_id} · {r.leave_type} · {r.shift_date}
              </span>
              <button
                type="button"
                onClick={() => updateStatus.mutate({ id: r.id, status: 'Granted' })}
                style={{
                  padding: '8px 14px',
                  minHeight: mobile ? MIN_TAP_TARGET : undefined,
                  borderRadius: 6,
                  border: 'none',
                  background: t.ok,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Approve
              </button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
