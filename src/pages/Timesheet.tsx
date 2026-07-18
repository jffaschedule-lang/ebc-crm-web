import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint, isMobile } from '../hooks/useBreakpoint';
import { apiGet, apiPost } from '../api/client';
import { TimesheetSegment } from '../types/domain';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { RTable, RTableColumn } from '../components/ui/RTable';
import { MobileList } from '../components/ui/MobileList';
import { MetricCard } from '../components/ui/MetricCard';
import { MIN_TAP_TARGET } from '../theme/spacing';

export default function Timesheet() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  const mobile = isMobile(bp);

  const [employeeId, setEmployeeId] = useState('');
  const [ppEnd, setPpEnd] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['timesheet', employeeId, ppEnd],
    queryFn: () => apiGet<TimesheetSegment[]>(`/api/timesheet/${employeeId}`, { pp_end: ppEnd }),
    enabled: Boolean(employeeId) && Boolean(ppEnd),
  });

  const exportMutation = useMutation({
    mutationFn: () => apiPost<{ url: string }>(`/api/timesheet/${employeeId}/export?pp_end=${ppEnd}`),
    onSuccess: (result) => window.open(result.url, '_blank'),
  });

  const segments = data ?? [];
  const totalHours = segments.reduce((sum, s) => sum + parseFloat(s.hours), 0);

  const inputStyle: React.CSSProperties = {
    padding: '8px 10px',
    minHeight: mobile ? MIN_TAP_TARGET : undefined,
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    flex: mobile ? '1 1 100%' : undefined,
  };

  const cols: RTableColumn<TimesheetSegment>[] = [
    { key: 'date', header: 'Date', render: (s) => s.shift_date },
    { key: 'type', header: 'Type', render: (s) => s.leave_type ?? s.segment_type },
    { key: 'in', header: 'In', render: (s) => s.time_in ?? s.leave_time_in ?? '—' },
    { key: 'out', header: 'Out', render: (s) => s.time_out ?? s.leave_time_out ?? '—' },
    { key: 'hours', header: 'Hours', render: (s) => parseFloat(s.hours).toFixed(2), numeric: true },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Employee ID (UUID)"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          style={{ ...inputStyle, minWidth: mobile ? undefined : 260 }}
        />
        <input type="date" value={ppEnd} onChange={(e) => setPpEnd(e.target.value)} style={inputStyle} />
        <button
          type="button"
          onClick={() => exportMutation.mutate()}
          disabled={!employeeId || !ppEnd || exportMutation.isPending}
          style={{
            padding: '8px 14px',
            minHeight: mobile ? MIN_TAP_TARGET : undefined,
            borderRadius: 6,
            border: 'none',
            background: t.pA,
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            flex: mobile ? '1 1 100%' : undefined,
            opacity: !employeeId || !ppEnd ? 0.6 : 1,
          }}
        >
          {exportMutation.isPending ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>

      {isLoading && <LoadingSpinner t={t} size={32} />}
      {error && <AlertBar t={t} type="crit">Couldn't build the timesheet. Check the employee ID and pay period, then try again.</AlertBar>}

      {!isLoading && !error && !employeeId && (
        <p style={{ color: t.textFaint, fontSize: 13 }}>Enter an employee ID and pay period end date to view a timesheet.</p>
      )}

      {!isLoading && !error && employeeId && ppEnd && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            <MetricCard t={t} label="Segments" value={segments.length} />
            <MetricCard t={t} label="Total Hours" value={totalHours.toFixed(2)} />
            <MetricCard t={t} label="Pay Period End" value={ppEnd} />
          </div>

          {mobile ? (
            <MobileList
              t={t}
              rows={segments}
              rowKey={(s) => s.id}
              emptyMessage="No timesheet segments for this pay period."
              renderItem={(s) => (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: t.text }}>{s.shift_date}</span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: t.text,
                        fontFamily: 'ui-monospace, SF Mono, Consolas, monospace',
                      }}
                    >
                      {parseFloat(s.hours).toFixed(2)}h
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
                    {s.leave_type ?? s.segment_type} · {s.time_in ?? s.leave_time_in ?? '—'}–{s.time_out ?? s.leave_time_out ?? '—'}
                  </div>
                </div>
              )}
            />
          ) : (
            <RTable t={t} bp={bp} cols={cols} rows={segments} rowKey={(s) => s.id} emptyMessage="No timesheet segments for this pay period." />
          )}
        </>
      )}
    </div>
  );
}
