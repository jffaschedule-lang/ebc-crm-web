import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useAuth } from '../auth/useAuth';
import { apiGet } from '../api/client';
import { OtRequest, OtTierBoardRow } from '../types/domain';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { RTable, RTableColumn } from '../components/ui/RTable';
import { Card } from '../components/ui/Card';
import { PlatoonChip } from '../components/ui/PlatoonChip';
import { Pill } from '../components/ui/Pill';
import { OTAvailabilityForm } from '../components/forms/OTAvailabilityForm';

const RANK_GROUPS = ['dc', 'capt', 'lt', 'op', 'ff'];
const LADDER = ['T-24h', 'T-12h', 'T-1h', 'T-15m'];

export default function Overtime() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  const { user } = useAuth();

  const [rankGroup, setRankGroup] = useState('ff');

  const { data: tierBoard, isLoading: tierLoading } = useQuery({
    queryKey: ['ot-tier', rankGroup],
    queryFn: () => apiGet<OtTierBoardRow[]>(`/api/overtime/tier/${rankGroup}`),
  });

  const { data: requests, isLoading: requestsLoading, error: requestsError } = useQuery({
    queryKey: ['ot-requests'],
    queryFn: () => apiGet<OtRequest[]>('/api/overtime/requests'),
  });

  const tierCols: RTableColumn<OtTierBoardRow>[] = [
    { key: 'name', header: 'Name', render: (r) => r.full_name },
    { key: 'rank', header: 'Rank', render: (r) => r.rank, hideAt: ['md'] },
    { key: 'platoon', header: 'Platoon', render: (r) => <PlatoonChip t={t} platoon={r.platoon} /> },
    { key: 'days', header: 'Days Since OT', render: (r) => r.days_since_ot },
  ];

  const requestCols: RTableColumn<OtRequest>[] = [
    { key: 'date', header: 'Shift Date', render: (r) => r.shift_date },
    { key: 'rank_group', header: 'Rank Group', render: (r) => r.rank_group, hideAt: ['md'] },
    { key: 'status', header: 'Status', render: (r) => r.status },
    { key: 'stage', header: 'Ladder Stage', render: (r) => r.ladder_stage ?? '—' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'start' }}>
        <div>
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {RANK_GROUPS.map((rg) => (
              <button
                key={rg}
                type="button"
                onClick={() => setRankGroup(rg)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: `1px solid ${rg === rankGroup ? t.pA : t.border}`,
                  background: rg === rankGroup ? t.pA : t.surfaceAlt,
                  color: rg === rankGroup ? '#fff' : t.text,
                  cursor: 'pointer',
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                {rg}
              </button>
            ))}
          </div>

          {tierLoading ? (
            <LoadingSpinner t={t} />
          ) : (
            <RTable t={t} bp={bp} cols={tierCols} rows={tierBoard ?? []} rowKey={(r) => r.employee_id} />
          )}

          <Card t={t} style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 13, color: t.text, marginTop: 0, marginBottom: 10 }}>Notification Ladder</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LADDER.map((stage) => (
                <Pill key={stage} t={t} color="blue">
                  {stage}
                </Pill>
              ))}
            </div>
          </Card>

          <Card t={t} style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 13, color: t.text, marginTop: 0, marginBottom: 10 }}>OT Requests</h3>
            {requestsLoading && <LoadingSpinner t={t} />}
            {requestsError && <AlertBar t={t} type="crit">Failed to load OT requests.</AlertBar>}
            {!requestsLoading && !requestsError && (
              <RTable t={t} bp={bp} cols={requestCols} rows={requests ?? []} rowKey={(r) => r.id} />
            )}
          </Card>
        </div>

        <Card t={t}>
          <h3 style={{ fontSize: 13, color: t.text, marginTop: 0, marginBottom: 10 }}>Add Availability</h3>
          <OTAvailabilityForm t={t} employeeId={user?.id ?? ''} />
        </Card>
      </div>
    </div>
  );
}
