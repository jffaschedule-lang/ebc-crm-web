import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { apiGet, apiPost } from '../api/client';
import { TimesheetSegment } from '../types/domain';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';

export default function Timesheet() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);

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
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Employee ID (UUID)"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          style={{ ...inputStyle, minWidth: 260 }}
        />
        <input type="date" value={ppEnd} onChange={(e) => setPpEnd(e.target.value)} style={inputStyle} />
        <button
          type="button"
          onClick={() => exportMutation.mutate()}
          disabled={!employeeId || !ppEnd || exportMutation.isPending}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: 'none',
            background: t.pA,
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {exportMutation.isPending ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>

      {isLoading && <LoadingSpinner t={t} size={32} />}
      {error && <AlertBar t={t} type="crit">Failed to build timesheet.</AlertBar>}

      {!isLoading && !error && employeeId && ppEnd && (
        <div style={{ overflowX: 'auto', border: `1px solid ${t.border}`, borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: t.surfaceAlt }}>
                <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: t.textMuted }}>Date</th>
                <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: t.textMuted }}>Type</th>
                <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: t.textMuted }}>In</th>
                <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: t.textMuted }}>Out</th>
                <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: t.textMuted }}>Hours</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((s) => (
                <tr
                  key={s.id}
                  style={{
                    borderTop: `1px solid ${t.border}`,
                    background: s.segment_type === 'leave' ? t.okBg : 'transparent',
                  }}
                >
                  <td style={{ padding: 8, color: t.text }}>{s.shift_date}</td>
                  <td style={{ padding: 8, color: t.text }}>{s.leave_type ?? s.segment_type}</td>
                  <td style={{ padding: 8, color: t.text }}>{s.time_in ?? s.leave_time_in}</td>
                  <td style={{ padding: 8, color: t.text }}>{s.time_out ?? s.leave_time_out}</td>
                  <td style={{ padding: 8, color: t.text }}>{parseFloat(s.hours).toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${t.border}`, fontWeight: 700 }}>
                <td style={{ padding: 8, color: t.text }} colSpan={4}>
                  Total
                </td>
                <td style={{ padding: 8, color: t.text }}>{totalHours.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
