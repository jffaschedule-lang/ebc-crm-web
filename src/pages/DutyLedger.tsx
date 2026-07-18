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
import { MIN_TAP_TARGET } from '../theme/spacing';

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
    { key: 'hours', header: 'Hours', render: (r) => parseFloat(r.hours_worked).toFixed(2), hideAt: ['md', 'lg'], numeric: true },
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
          style={{
            padding: '8px 10px',
            minHeight: mobile ? MIN_TAP_TARGET : undefined,
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
            flex: mobile ? 1 : undefined,
          }}
        />
        <select
          value={platoonFilter}
          onChange={(e) => setPlatoonFilter(e.target.value)}
          style={{
            padding: '8px 10px',
            minHeight: mobile ? MIN_TAP_TARGET : undefined,
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
          }}
        >
          <option value="">All platoons</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>

      {trainError && <AlertBar t={t} type="crit">{trainError}</AlertBar>}

      {isLoading && <LoadingSpinner t={t} size={32} />}
      {error && <AlertBar t={t} type="crit">Couldn't load the duty ledger for {date}. Check your connection and reload.</AlertBar>}

      {!isLoading && !error && (
        mobile ? (
          <MobileList
            t={t}
            rows={rows}
            rowKey={(r) => r.id}
            emptyMessage={`No duty ledger entries for ${date} yet.`}
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
          <RTable
            t={t}
            bp={bp}
            cols={cols}
            rows={rows}
            rowKey={(r) => r.id}
            emptyMessage={`No duty ledger entries for ${date} yet.`}
          />
        )
      )}

      <DetAssignmentCard t={t} date={date} />
    </div>
  );
}

function DetAssignmentCard({ t, date }: { t: ReturnType<typeof tokensFor>; date: string }) {
  const queryClient = useQueryClient();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);

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

  const inputStyle: React.CSSProperties = {
    padding: '8px 10px',
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    minHeight: mobile ? MIN_TAP_TARGET : undefined,
    width: mobile ? '100%' : undefined,
  };

  return (
    <Card t={t} style={{ marginTop: 20 }}>
      <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 4 }}>Detail Assignment (DET)</h3>
      <p style={{ fontSize: 12, color: t.textMuted, marginTop: 0, marginBottom: 10 }}>
        Sequential assignments are allowed (e.g. 07:00–14:00 then 14:00–07:00). Overlapping times, or a
        detail during approved leave, will be rejected.
      </p>

      {detError && <AlertBar t={t} type="crit">{detError}</AlertBar>}
      {detOk && !detError && (
        <div style={{ fontSize: 12, color: t.ok, marginBottom: 10 }}>{detOk}</div>
      )}

      <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} style={{ ...inputStyle, minWidth: mobile ? undefined : 200 }}>
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
          style={{ ...inputStyle, flex: mobile ? undefined : 1, minWidth: mobile ? undefined : 200 }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <input type="time" value={spanStart} onChange={(e) => setSpanStart(e.target.value)} style={{ ...inputStyle, flex: mobile ? 1 : undefined }} />
          <input type="time" value={spanEnd} onChange={(e) => setSpanEnd(e.target.value)} style={{ ...inputStyle, flex: mobile ? 1 : undefined }} />
        </div>
        <button
          onClick={() => createDet.mutate()}
          disabled={createDet.isPending || !employeeId || !location}
          style={{
            padding: '8px 16px',
            minHeight: mobile ? MIN_TAP_TARGET : undefined,
            borderRadius: 6,
            fontSize: 13,
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

      <RTable
        t={t}
        bp={bp}
        rowKey={(d) => d.id}
        rows={detRecords ?? []}
        emptyMessage={`No detail assignments for ${date} yet.`}
        cols={[
          { key: 'employee', header: 'Employee', render: (d) => nameFor(d.employee_id) },
          { key: 'location', header: 'Location', render: (d) => d.detail_location },
          { key: 'span', header: 'Span', render: (d) => `${d.span_start}–${d.span_end}`, numeric: true },
          { key: 'status', header: 'Status', render: (d) => <StatusChip t={t} status={d.status} /> },
        ]}
      />
    </Card>
  );
}
