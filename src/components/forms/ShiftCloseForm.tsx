import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ThemeTokens } from '../../theme/tokens';
import { apiGet, apiPost } from '../../api/client';
import { DutyLedgerRow } from '../../types/domain';
import { Plate } from '../ui/Plate';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useBreakpoint, isMobile } from '../../hooks/useBreakpoint';
import { MIN_TAP_TARGET } from '../../theme/spacing';

interface ShiftCloseFormProps {
  t: ThemeTokens;
  shiftDate: string;
  station: string;
  platoon: 'A' | 'B' | 'C';
}

interface Correction {
  duty_ledger_id: string;
  shift_end?: string;
  acting_note?: string | null;
}

export function ShiftCloseForm({ t, shiftDate, station, platoon }: ShiftCloseFormProps) {
  const queryClient = useQueryClient();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const [corrections, setCorrections] = useState<Record<string, Correction>>({});

  const { data: dutyRows, isLoading } = useQuery({
    queryKey: ['duty-ledger', shiftDate],
    queryFn: () => apiGet<DutyLedgerRow[]>(`/api/duty-ledger/date/${shiftDate}`),
    enabled: Boolean(shiftDate),
  });

  const stationRows = (dutyRows ?? []).filter((r) => r.station === station);

  const closeMutation = useMutation({
    mutationFn: () =>
      apiPost('/api/shift-close', {
        shift_date: shiftDate,
        station,
        platoon,
        entries: Object.values(corrections),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-close'] });
      setCorrections({});
    },
  });

  if (isLoading) return <LoadingSpinner t={t} />;

  const cellInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    minHeight: mobile ? MIN_TAP_TARGET : undefined,
    borderRadius: 4,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    fontSize: 13,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {stationRows.length === 0 && (
        <p style={{ color: t.textFaint, fontSize: 13 }}>No duty ledger entries for {station} on {shiftDate}.</p>
      )}

      {stationRows.length > 0 && (
        <div className="rtable-scroll" style={{ border: `1px solid ${t.border}`, borderRadius: 10 }}>
          <table className="rtable" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8, fontSize: 11, fontWeight: 600, color: t.textMuted, borderBottom: `1px solid ${t.border}` }}>Company</th>
                <th style={{ textAlign: 'left', padding: 8, fontSize: 11, fontWeight: 600, color: t.textMuted, borderBottom: `1px solid ${t.border}` }}>Shift End</th>
                <th style={{ textAlign: 'left', padding: 8, fontSize: 11, fontWeight: 600, color: t.textMuted, borderBottom: `1px solid ${t.border}` }}>Acting Note</th>
              </tr>
            </thead>
            <tbody>
              {stationRows.map((row) => (
                <tr key={row.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                  <td style={{ padding: 8 }}>
                    <Plate t={t} code={row.company_code} />
                  </td>
                  <td style={{ padding: 8, minWidth: 110 }}>
                    <input
                      type="time"
                      defaultValue={row.shift_end}
                      onChange={(e) =>
                        setCorrections((prev) => ({
                          ...prev,
                          [row.id]: { ...prev[row.id], duty_ledger_id: row.id, shift_end: e.target.value },
                        }))
                      }
                      style={cellInputStyle}
                    />
                  </td>
                  <td style={{ padding: 8, minWidth: 160 }}>
                    <input
                      type="text"
                      defaultValue={row.acting_note ?? ''}
                      onChange={(e) =>
                        setCorrections((prev) => ({
                          ...prev,
                          [row.id]: { ...prev[row.id], duty_ledger_id: row.id, acting_note: e.target.value },
                        }))
                      }
                      style={cellInputStyle}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={() => closeMutation.mutate()}
        disabled={closeMutation.isPending}
        style={{
          alignSelf: mobile ? 'stretch' : 'flex-start',
          padding: '10px 16px',
          minHeight: mobile ? MIN_TAP_TARGET : undefined,
          borderRadius: 6,
          border: 'none',
          background: t.pA,
          color: '#fff',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        {closeMutation.isPending ? 'Closing…' : 'Sign & Close Shift'}
      </button>

      {closeMutation.isSuccess && <p style={{ color: t.ok, fontSize: 13 }}>Shift closed and packet queued.</p>}
    </div>
  );
}
