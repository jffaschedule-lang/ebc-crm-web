import { useState } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint, isMobile } from '../hooks/useBreakpoint';
import { apiGet } from '../api/client';
import { DutyLedgerRow } from '../types/domain';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { RTable, RTableColumn } from '../components/ui/RTable';
import { MobileList } from '../components/ui/MobileList';
import { PlatoonChip } from '../components/ui/PlatoonChip';
import { Plate } from '../components/ui/Plate';
import { StatusChip } from '../components/ui/StatusChip';

const TODAY = format(new Date(), 'yyyy-MM-dd');

export default function DutyLedger() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  const mobile = isMobile(bp);

  const [date, setDate] = useState(TODAY);
  const [platoonFilter, setPlatoonFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['duty-ledger', date],
    queryFn: () => apiGet<DutyLedgerRow[]>(`/api/duty-ledger/date/${date}`),
  });

  const rows = (data ?? []).filter((r) => !platoonFilter || r.platoon === platoonFilter);

  const cols: RTableColumn<DutyLedgerRow>[] = [
    { key: 'company', header: 'Company', render: (r) => <Plate t={t} code={r.company_code} /> },
    { key: 'station', header: 'Station', render: (r) => r.station, hideAt: ['md'] },
    { key: 'platoon', header: 'Platoon', render: (r) => <PlatoonChip t={t} platoon={r.platoon} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusChip t={t} status={r.duty_status} /> },
    { key: 'hours', header: 'Hours', render: (r) => parseFloat(r.hours_worked).toFixed(2), hideAt: ['md', 'lg'] },
    { key: 'acting', header: 'Acting Note', render: (r) => r.acting_note ?? '—' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text }}
        />
        <select
          value={platoonFilter}
          onChange={(e) => setPlatoonFilter(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text }}
        >
          <option value="">All platoons</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>

      {isLoading && <LoadingSpinner t={t} size={32} />}
      {error && <AlertBar t={t} type="crit">Failed to load duty ledger for {date}.</AlertBar>}

      {!isLoading && !error && (
        mobile ? (
          <MobileList
            t={t}
            rows={rows}
            rowKey={(r) => r.id}
            renderItem={(r) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Plate t={t} code={r.company_code} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: t.text }}>{r.station}</div>
                  <div style={{ fontSize: 11, color: t.textMuted }}>{r.acting_note ?? 'No acting note'}</div>
                </div>
                <StatusChip t={t} status={r.duty_status} />
              </div>
            )}
          />
        ) : (
          <RTable t={t} bp={bp} cols={cols} rows={rows} rowKey={(r) => r.id} />
        )
      )}
    </div>
  );
}
