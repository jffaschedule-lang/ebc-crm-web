import { useState } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint, isMobile } from '../hooks/useBreakpoint';
import { apiGet } from '../api/client';
import { MetricCard } from '../components/ui/MetricCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Plate } from '../components/ui/Plate';

const TODAY = format(new Date(), 'yyyy-MM-dd');

interface WorkforceCompanyReport {
  company_code: string;
  station: string;
  district: number | null;
  required_seats: number;
  on_duty_count: number;
  total_assigned: number;
  shortage: number;
  shortage_flag: boolean;
}

export default function WorkforceReport() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  const mobile = isMobile(bp);

  const [date, setDate] = useState(TODAY);

  const { data, isLoading, error } = useQuery({
    queryKey: ['workforce', date],
    queryFn: () => apiGet<WorkforceCompanyReport[]>(`/api/workforce/date/${date}`),
  });

  const report = data ?? [];
  const totalRequired = report.reduce((sum, r) => sum + r.required_seats, 0);
  const totalOnDuty = report.reduce((sum, r) => sum + r.on_duty_count, 0);
  const shortages = report.filter((r) => r.shortage_flag);
  const districts = Array.from(new Set(report.map((r) => r.district).filter((d): d is number => d != null)));

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <MetricCard t={t} label="Companies" value={report.length} />
        <MetricCard t={t} label="Required Seats" value={totalRequired} />
        <MetricCard t={t} label="On Duty" value={totalOnDuty} />
        <MetricCard t={t} label="Shortages" value={shortages.length} />
      </div>

      {isLoading && <LoadingSpinner t={t} size={32} />}
      {error && <AlertBar t={t} type="crit">Failed to load workforce report.</AlertBar>}

      {shortages.length > 0 && (
        <AlertBar t={t} type="crit">
          {shortages.length} station(s) below required staffing. Resolution steps: 1) check OT tier board for
          available members, 2) send OT offer via the notification ladder, 3) escalate to DC if unfilled within
          1 hour of shift start.
        </AlertBar>
      )}

      {!isLoading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {report.map((r) => (
            <Card key={r.company_code} t={t}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Plate t={t} code={r.company_code} />
                <span style={{ fontSize: 12, color: t.textMuted }}>{r.station}</span>
              </div>
              <div style={{ fontSize: 12, color: t.text, marginBottom: 6 }}>
                {r.on_duty_count} / {r.required_seats} seats filled
              </div>
              <ProgressBar t={t} percent={(r.on_duty_count / Math.max(1, r.required_seats)) * 100} />
              {r.shortage_flag && (
                <div style={{ fontSize: 11, color: t.crit, marginTop: 6 }}>Short {r.shortage} seat(s)</div>
              )}
            </Card>
          ))}
        </div>
      )}

      {districts.length > 0 && (
        <Card t={t}>
          <h3 style={{ fontSize: 13, color: t.text, marginTop: 0, marginBottom: 10 }}>District Rollup</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: t.surfaceAlt }}>
                <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: t.textMuted }}>District</th>
                <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: t.textMuted }}>Required</th>
                <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: t.textMuted }}>On Duty</th>
              </tr>
            </thead>
            <tbody>
              {districts.map((d) => {
                const inDistrict = report.filter((r) => r.district === d);
                return (
                  <tr key={d} style={{ borderTop: `1px solid ${t.border}` }}>
                    <td style={{ padding: 8, color: t.text }}>{d}</td>
                    <td style={{ padding: 8, color: t.text }}>{inDistrict.reduce((s, r) => s + r.required_seats, 0)}</td>
                    <td style={{ padding: 8, color: t.text }}>{inDistrict.reduce((s, r) => s + r.on_duty_count, 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
