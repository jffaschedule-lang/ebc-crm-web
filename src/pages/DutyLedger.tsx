import { useState } from 'react';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint, isMobile } from '../hooks/useBreakpoint';
import { apiGet, apiPatch, apiPost } from '../api/client';
import { DutyLedgerRow, Employee } from '../types/domain';
import { ApiError } from '../types/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { RTable, RTableColumn } from '../components/ui/RTable';
import { MobileList } from '../components/ui/MobileList';
import { PlatoonChip } from '../components/ui/PlatoonChip';
import { Plate } from '../components/ui/Plate';
import { StatusChip } from '../components/ui/StatusChip';
import { Card } from '../components/ui/Card';

const TODAY = format(new Date(), 'yyyy-MM-dd');

interface DetRecord {
  id: string;
  employee_id: string;
  shift_date: string;
  detail_location: string;
  span_start: string;
  span_end: string;
  status: string;
}

function errorMessage(err: unknown): string {
  const apiErr = err as ApiError;
  return apiErr?.error?.message ?? 'Request failed.';
}

export default function DutyLedger() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const queryClient = useQueryClient();

  const [date, setDate] = useState(TODAY);
  const [platoonFilter, setPlatoonFilter] = useState('');
  const [trainError, setTrainError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['duty-ledger', date],
    queryFn: () => apiGet<DutyLedgerRow[]>(`/api/duty-ledger/date/${date}`),
  });

  const setDutyStatus = useMutation({
    mutationFn: ({ id, duty_status }: { id: string; duty_status: 'O' | 'Train' }) =>
      apiPatch(`/api/duty-ledger/${id}`, { duty_status }),
    onSuccess: () => {
      setTrainError('');
      queryClient.invalidateQueries({ queryKey: ['duty-ledger', date] });
    },
    onError: (err) => setTrainError(errorMessage(err)),
  });

  const rows = (data ?? []).filter((r) => !platoonFilter || r.platoon === platoonFilter);

  const trainToggle = (r: DutyLedgerRow) => {
    if (r.duty_status !== 'O' && r.duty_status !== 'Train') return <span>—</span>;
    const toTrain = r.duty_status === 'O';
    return (
      <button
        onClick={() => setDutyStatus.mutate({ id: r.id, duty_status: toTrain ? 'Train' : 'O' })}
        disabled={setDutyStatus.isPending}
        style={{
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          border: `1px solid ${toTrain ? t.train : t.border}`,
          background: toTrain ? t.trainBg : t.surfaceAlt,
          color: toTrain ? t.train : t.text,
        }}
      >
        {toTrain ? 'Set Train' : 'Return to O'}
      </button>
    );
  };

  const cols: RTableColumn<DutyLedgerRow>[] = [
    { key: 'company', header: 'Company', render: (r) => <Plate t={t} code={r.company_code} /> },
    { key: 'station', header: 'Station', render: (r) => r.station, hideAt: ['md'] },
    { key: 'platoon', header: 'Platoon', render: (r) => <PlatoonChip t={t} platoon={r.platoon} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusChip t={t} status={r.duty_status} /> },
    { key: 'hours', header: 'Hours', render: (r) => parseFloat(r.hours_worked).toFixed(2), hideAt: ['md', 'lg'] },
    { key: 'acting', header: 'Acting Note', render: (r) => r.acting_note ?? '—' },
    { key: 'train', header: 'Training', render: trainToggle },
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

      {trainError && <AlertBar t={t} type="crit">{trainError}</AlertBar>}

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
                {trainToggle(r)}
              </div>
            )}
          />
        ) : (
          <RTable t={t} bp={bp} cols={cols} rows={rows} rowKey={(r) => r.id} />
        )
      )}

      <DetAssignmentCard t={t} date={date} />
    </div>
  );
}

function DetAssignmentCard({ t, date }: { t: ReturnType<typeof tokensFor>; date: string }) {
  const queryClient = useQueryClient();

  const [employeeId, setEmployeeId] = useState('');
  const [location, setLocation] = useState('');
  const [spanStart, setSpanStart] = useState('07:00');
  const [spanEnd, setSpanEnd] = useState('07:00');
  const [detError, setDetError] = useState('');
  const [detOk, setDetOk] = useState('');

  const { data: employees } = useQuery({
    queryKey: ['employees', 'det-form'],
    queryFn: () => apiGet<Employee[]>('/api/employees', { limit: 200 }),
  });

  const { data: detRecords } = useQuery({
    queryKey: ['det', date],
    queryFn: () => apiGet<DetRecord[]>(`/api/det/date/${date}`),
  });

  const createDet = useMutation({
    mutationFn: () =>
      apiPost(`/api/det`, {
        employee_id: employeeId,
        shift_date: date,
        detail_location: location,
        span_start: spanStart,
        span_end: spanEnd,
      }),
    onSuccess: () => {
      setDetError('');
      setDetOk(`Detail assignment created: ${location} ${spanStart}–${spanEnd} on ${date}.`);
      setLocation('');
      queryClient.invalidateQueries({ queryKey: ['det', date] });
    },
    onError: (err) => {
      setDetOk('');
      setDetError(errorMessage(err));
    },
  });

  const sortedEmployees = (employees ?? [])
    .slice()
    .sort((a, b) => a.last_name.localeCompare(b.last_name));
  const nameFor = (id: string) => {
    const e = (employees ?? []).find((emp) => emp.id === id);
    return e ? `${e.last_name}, ${e.first_name}` : id;
  };

  const inputStyle = {
    padding: '8px 10px',
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
  } as const;

  return (
    <Card t={t} style={{ marginTop: 20 }}>
      <h3 style={{ fontSize: 13, color: t.text, marginTop: 0, marginBottom: 4 }}>Detail Assignment (DET)</h3>
      <p style={{ fontSize: 12, color: t.textMuted, marginTop: 0, marginBottom: 10 }}>
        Sequential assignments are allowed (e.g. 07:00–14:00 then 14:00–07:00). Overlapping times, or a
        detail during approved leave, will be rejected.
      </p>

      {detError && <AlertBar t={t} type="crit">{detError}</AlertBar>}
      {detOk && !detError && (
        <div style={{ fontSize: 12, color: t.ok, marginBottom: 10 }}>{detOk}</div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} style={{ ...inputStyle, minWidth: 200 }}>
          <option value="">Select employee…</option>
          {sortedEmployees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.last_name}, {e.first_name} ({e.rank} · {e.platoon})
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Detail location (e.g. E148 / Station 14)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
        />
        <input type="time" value={spanStart} onChange={(e) => setSpanStart(e.target.value)} style={inputStyle} />
        <input type="time" value={spanEnd} onChange={(e) => setSpanEnd(e.target.value)} style={inputStyle} />
        <button
          onClick={() => createDet.mutate()}
          disabled={createDet.isPending || !employeeId || !location}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            border: `1px solid ${t.pB}`,
            background: t.pB,
            color: '#fff',
            opacity: createDet.isPending || !employeeId || !location ? 0.6 : 1,
          }}
        >
          Assign
        </button>
      </div>

      {(detRecords ?? []).length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: t.surfaceAlt }}>
              <th style={{ textAlign: 'left', padding: 6, fontSize: 10, color: t.textMuted }}>Employee</th>
              <th style={{ textAlign: 'left', padding: 6, fontSize: 10, color: t.textMuted }}>Location</th>
              <th style={{ textAlign: 'left', padding: 6, fontSize: 10, color: t.textMuted }}>Span</th>
              <th style={{ textAlign: 'left', padding: 6, fontSize: 10, color: t.textMuted }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(detRecords ?? []).map((d) => (
              <tr key={d.id} style={{ borderTop: `1px solid ${t.border}` }}>
                <td style={{ padding: 6, color: t.text }}>{nameFor(d.employee_id)}</td>
                <td style={{ padding: 6, color: t.text }}>{d.detail_location}</td>
                <td style={{ padding: 6, color: t.text }}>{d.span_start}–{d.span_end}</td>
                <td style={{ padding: 6 }}><StatusChip t={t} status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
