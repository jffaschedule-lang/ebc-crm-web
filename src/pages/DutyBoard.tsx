import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint, isMobile } from '../hooks/useBreakpoint';
import { useRealtime } from '../hooks/useRealtime';
import { useRotation, useRotationPeriod } from '../hooks/useRotation';
import { apiGet } from '../api/client';
import { DutyLedgerRow } from '../types/domain';
import { AlertBar } from '../components/ui/AlertBar';
import { MetricCard } from '../components/ui/MetricCard';
import { RotationStrip } from '../components/ui/RotationStrip';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card } from '../components/ui/Card';
import { StatusChip } from '../components/ui/StatusChip';
import { Plate } from '../components/ui/Plate';

const TODAY = format(new Date(), 'yyyy-MM-dd');

export default function DutyBoard() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  useRealtime();

  const { data: rotation, isLoading: rotationLoading, error: rotationError } = useRotation(TODAY);
  const { data: periodDays } = useRotationPeriod(rotation?.pp_end ?? '');

  const { data: dutyRows, isLoading: dutyLoading } = useQuery({
    queryKey: ['duty-ledger', TODAY],
    queryFn: () => apiGet<DutyLedgerRow[]>(`/api/duty-ledger/date/${TODAY}`),
  });

  if (rotationLoading || dutyLoading) return <LoadingSpinner t={t} size={32} />;

  const rows = dutyRows ?? [];
  const onDuty = rows.filter((r) => r.duty_status === 'O').length;
  const onLeave = rows.filter((r) => r.duty_status !== 'O').length;
  const needsAction = rows.filter((r) => r.acting_note);
  const mobile = isMobile(bp);

  return (
    <div>
      <AlertBar t={t} type="warn">
        Legacy Google Sheets cutover in progress — this is the production system of record.
      </AlertBar>

      {rotationError && (
        <AlertBar t={t} type="crit">
          No rotation schedule entry found for today ({TODAY}). Run the rotation seed for this date range.
        </AlertBar>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <MetricCard t={t} label="On Duty Today" value={onDuty} sub={rotation ? `Platoon ${rotation.platoon}` : ''} />
        <MetricCard t={t} label="On Leave" value={onLeave} />
        <MetricCard t={t} label="Acting Assignments" value={needsAction.length} />
        <MetricCard t={t} label="Total Assigned" value={rows.length} />
      </div>

      {periodDays && periodDays.length > 0 && (
        <Card t={t} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, color: t.text, marginTop: 0, marginBottom: 10 }}>Pay Period Rotation</h3>
          <RotationStrip t={t} days={periodDays} todayIso={TODAY} />
        </Card>
      )}

      <Card t={t}>
        <h3 style={{ fontSize: 13, color: t.text, marginTop: 0, marginBottom: 10 }}>Needs Action</h3>
        {needsAction.length === 0 && <p style={{ color: t.textFaint, fontSize: 13 }}>Nothing needs attention.</p>}
        {needsAction.map((row) => (
          <div
            key={row.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0',
              borderTop: `1px solid ${t.border}`,
            }}
          >
            <Plate t={t} code={row.company_code} />
            <span style={{ fontSize: 13, color: t.text, flex: 1 }}>{row.acting_note}</span>
            <StatusChip t={t} status={row.duty_status} />
          </div>
        ))}
      </Card>
    </div>
  );
}
