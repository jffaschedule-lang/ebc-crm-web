import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint, isMobile, isTablet } from '../hooks/useBreakpoint';
import { useRealtime } from '../hooks/useRealtime';
import { useRotation, useRotationPeriod } from '../hooks/useRotation';
import { useMyRole } from '../hooks/useMyRole';
import { useGenerateDutyLedger } from '../hooks/useDutyLedger';
import { apiGet } from '../api/client';
import { DutyLedgerRow } from '../types/domain';
import { AlertBar } from '../components/ui/AlertBar';
import { DismissibleInfoBar } from '../components/ui/DismissibleInfoBar';
import { MetricCard } from '../components/ui/MetricCard';
import { RotationStrip } from '../components/ui/RotationStrip';
import { LoadingSpinner, InlineSpinner } from '../components/ui/LoadingSpinner';
import { Card } from '../components/ui/Card';
import { StatusChip } from '../components/ui/StatusChip';
import { Plate } from '../components/ui/Plate';
import { MIN_TAP_TARGET } from '../theme/spacing';

const TODAY = format(new Date(), 'yyyy-MM-dd');
const REFETCH_MS = 30000;

function agoLabel(seconds: number): string {
  if (seconds < 2) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
}

export default function DutyBoard() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  useRealtime();

  const { isSupervisorOrAdmin } = useMyRole();
  const generateLedger = useGenerateDutyLedger();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const { data: rotation, isLoading: rotationLoading, error: rotationError } = useRotation(TODAY);
  const { data: periodDays } = useRotationPeriod(rotation?.pp_end ?? '');

  const { data: dutyRows, isLoading: dutyLoading, dataUpdatedAt } = useQuery({
    queryKey: ['duty-ledger', TODAY],
    queryFn: () => apiGet<DutyLedgerRow[]>(`/api/duty-ledger/date/${TODAY}`),
    refetchInterval: REFETCH_MS,
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(null), 3500);
    return () => clearTimeout(timer);
  }, [successMsg]);

  if (rotationLoading || dutyLoading) return <LoadingSpinner t={t} size={32} />;

  const rows = dutyRows ?? [];
  // Train is duty, not leave: excluded from the on-duty count (the employee is
  // away from the station) but it must never be reported as leave.
  const onDuty = rows.filter((r) => r.duty_status === 'O').length;
  const inTraining = rows.filter((r) => r.duty_status === 'Train').length;
  const onLeave = rows.filter((r) => r.duty_status !== 'O' && r.duty_status !== 'Train').length;
  const needsAction = rows.filter((r) => r.acting_note);
  const mobile = isMobile(bp);
  const tablet = isTablet(bp);
  const showGenerateButton = rows.length === 0 && isSupervisorOrAdmin;
  const secondsAgo = dataUpdatedAt ? Math.max(0, Math.floor((now - dataUpdatedAt) / 1000)) : null;

  return (
    <div>
      <DismissibleInfoBar t={t} storageKey="ebc-legacy-notice-dismissed">
        EBC Workforce CRM — Production system. Duty board data updates automatically every 30 seconds.
      </DismissibleInfoBar>

      {rotationError && (
        <AlertBar t={t} type="crit">
          No rotation schedule entry found for today ({TODAY}). Run the rotation seed for this date range.
        </AlertBar>
      )}

      {showGenerateButton && (
        <AlertBar t={t} type="warn">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span>No duty ledger rows exist for today yet.</span>
            <button
              type="button"
              onClick={() => generateLedger.mutate(TODAY, { onSuccess: () => setSuccessMsg("Today's duty ledger has been generated.") })}
              disabled={generateLedger.isPending}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                minHeight: MIN_TAP_TARGET,
                borderRadius: 6,
                border: 'none',
                background: t.pA,
                color: '#fff',
                fontWeight: 600,
                fontSize: 12,
                cursor: generateLedger.isPending ? 'default' : 'pointer',
                opacity: generateLedger.isPending ? 0.7 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {generateLedger.isPending && <InlineSpinner size={11} />}
              {generateLedger.isPending ? 'Generating…' : "Generate Today's Duty Ledger"}
            </button>
          </div>
        </AlertBar>
      )}
      {successMsg && <AlertBar t={t} type="ok">{successMsg}</AlertBar>}
      {generateLedger.isError && (
        <AlertBar t={t} type="crit">
          {(generateLedger.error as { error?: { message?: string } })?.error?.message ?? 'Failed to generate duty ledger.'}
        </AlertBar>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr 1fr' : tablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 8,
        }}
      >
        <MetricCard t={t} label="On Duty Today" value={onDuty} sub={rotation ? `Platoon ${rotation.platoon}` : ''} />
        <MetricCard t={t} label="On Leave" value={onLeave} sub={inTraining > 0 ? `+${inTraining} in training` : ''} />
        <MetricCard t={t} label="Acting Assignments" value={needsAction.length} />
        <MetricCard t={t} label="Total Assigned" value={rows.length} />
      </div>

      <div style={{ fontSize: 11, color: t.textFaint, marginBottom: 20 }}>
        {secondsAgo !== null ? `Last updated: ${agoLabel(secondsAgo)}` : 'Last updated: —'}
      </div>

      {periodDays && periodDays.length > 0 && (
        <Card t={t} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Pay Period Rotation</h3>
          <RotationStrip t={t} days={periodDays} todayIso={TODAY} />
        </Card>
      )}

      <Card t={t}>
        <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Needs Action</h3>
        {needsAction.length === 0 && (
          <p style={{ color: t.textFaint, fontSize: 13 }}>No acting assignments need attention right now.</p>
        )}
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
