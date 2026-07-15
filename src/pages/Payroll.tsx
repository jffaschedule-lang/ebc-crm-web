import { useState } from 'react';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint, isMobile } from '../hooks/useBreakpoint';
import { apiGet, apiPost } from '../api/client';
import { PayrollRow } from '../types/domain';
import { MetricCard } from '../components/ui/MetricCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { RTable, RTableColumn } from '../components/ui/RTable';
import { Plate } from '../components/ui/Plate';

const TODAY = format(new Date(), 'yyyy-MM-dd');

export default function Payroll() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const queryClient = useQueryClient();

  const [date, setDate] = useState(TODAY);

  const { data, isLoading, error } = useQuery({
    queryKey: ['payroll', date],
    queryFn: () => apiGet<PayrollRow[]>(`/api/payroll/date/${date}`),
  });

  const generateMutation = useMutation({
    mutationFn: () => apiPost(`/api/payroll/date/${date}/generate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll', date] }),
  });

  const exportMutation = useMutation({
    mutationFn: (district: number) => apiPost<{ url: string }>(`/api/payroll/date/${date}/export/${district}`),
    onSuccess: (result) => window.open(result.url, '_blank'),
  });

  const rows = data ?? [];
  const totalHours = rows.reduce((sum, r) => sum + parseFloat(r.hours_worked), 0);
  const totalActingHours = rows.reduce((sum, r) => sum + parseFloat(r.acting_hours), 0);
  const totalLeaveHours = rows.reduce((sum, r) => sum + parseFloat(r.leave_hours_used), 0);
  const districts = Array.from(new Set(rows.map((r) => r.district).filter((d): d is number => d != null)));

  const cols: RTableColumn<PayrollRow>[] = [
    { key: 'company', header: 'Company', render: (r) => <Plate t={t} code={r.company_code} /> },
    { key: 'station', header: 'Station', render: (r) => r.station, hideAt: ['md'] },
    { key: 'hours', header: 'Hours', render: (r) => parseFloat(r.hours_worked).toFixed(2) },
    { key: 'acting', header: 'Acting Hrs', render: (r) => parseFloat(r.acting_hours).toFixed(2), hideAt: ['md', 'lg'] },
    { key: 'leave', header: 'Leave', render: (r) => (r.leave_type ? `${r.leave_type} (${parseFloat(r.leave_hours_used).toFixed(2)})` : '—') },
    { key: 'district', header: 'District', render: (r) => r.district ?? '—', hideAt: ['md'] },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text }}
        />
        <button
          type="button"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: t.pA, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
        >
          {generateMutation.isPending ? 'Generating…' : 'Generate Payroll'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
        <MetricCard t={t} label="Rows" value={rows.length} />
        <MetricCard t={t} label="Total Hours" value={totalHours.toFixed(1)} />
        <MetricCard t={t} label="Acting Hours" value={totalActingHours.toFixed(1)} />
        <MetricCard t={t} label="Leave Hours" value={totalLeaveHours.toFixed(1)} />
        <MetricCard t={t} label="Districts" value={districts.length} />
        <MetricCard t={t} label="Companies" value={new Set(rows.map((r) => r.company_code)).size} />
      </div>

      {isLoading && <LoadingSpinner t={t} size={32} />}
      {error && <AlertBar t={t} type="crit">Failed to load payroll for {date}.</AlertBar>}

      {!isLoading && !error && <RTable t={t} bp={bp} cols={cols} rows={rows} rowKey={(r) => r.id} />}

      {districts.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {districts.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => exportMutation.mutate(d)}
              disabled={exportMutation.isPending}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: `1px solid ${t.border}`,
                background: t.surfaceAlt,
                color: t.text,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Export District {d} Packet
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
