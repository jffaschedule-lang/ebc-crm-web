import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ThemeTokens } from '../../theme/tokens';
import { apiGet, apiPost } from '../../api/client';
import { DutyLedgerRow } from '../../types/domain';
import { Plate } from '../ui/Plate';
import { LoadingSpinner } from '../ui/LoadingSpinner';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: t.surfaceAlt }}>
              <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: t.textMuted }}>Company</th>
              <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: t.textMuted }}>Shift End</th>
              <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: t.textMuted }}>Acting Note</th>
            </tr>
          </thead>
          <tbody>
            {stationRows.map((row) => (
              <tr key={row.id} style={{ borderTop: `1px solid ${t.border}` }}>
                <td style={{ padding: 8 }}>
                  <Plate t={t} code={row.company_code} />
                </td>
                <td style={{ padding: 8 }}>
                  <input
                    type="time"
                    defaultValue={row.shift_end}
                    onChange={(e) =>
                      setCorrections((prev) => ({
                        ...prev,
                        [row.id]: { ...prev[row.id], duty_ledger_id: row.id, shift_end: e.target.value },
                      }))
                    }
                    style={{
                      padding: '4px 6px',
                      borderRadius: 4,
                      border: `1px solid ${t.border}`,
                      background: t.surfaceAlt,
                      color: t.text,
                    }}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <input
                    type="text"
                    defaultValue={row.acting_note ?? ''}
                    onChange={(e) =>
                      setCorrections((prev) => ({
                        ...prev,
                        [row.id]: { ...prev[row.id], duty_ledger_id: row.id, acting_note: e.target.value },
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      borderRadius: 4,
                      border: `1px solid ${t.border}`,
                      background: t.surfaceAlt,
                      color: t.text,
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => closeMutation.mutate()}
        disabled={closeMutation.isPending}
        style={{
          alignSelf: 'flex-start',
          padding: '9px 16px',
          borderRadius: 6,
          border: 'none',
          background: t.pA,
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {closeMutation.isPending ? 'Closing…' : 'Sign & Close Shift'}
      </button>

      {closeMutation.isSuccess && <p style={{ color: t.ok, fontSize: 13 }}>Shift closed and packet queued.</p>}
    </div>
  );
}
