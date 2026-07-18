import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDays, format, parseISO, subDays } from 'date-fns';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { ThemeTokens, tokensFor } from '../theme/tokens';
import { useBreakpoint, isMobile, isDesktop } from '../hooks/useBreakpoint';
import { apiGet, apiPost } from '../api/client';
import { useRotation } from '../hooks/useRotation';
import { useCompanies } from '../hooks/useCompanies';
import { Employee, Platoon, TimesheetSegment } from '../types/domain';
import { LoadingSpinner, InlineSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { RTable, RTableColumn } from '../components/ui/RTable';
import { MetricCard } from '../components/ui/MetricCard';
import { Card } from '../components/ui/Card';
import { MIN_TAP_TARGET } from '../theme/spacing';

const TODAY = format(new Date(), 'yyyy-MM-dd');
const PLATOONS: Platoon[] = ['A', 'B', 'C'];
const MOBILE_ONLY_HIDE = ['xs', 'sm'] as const;

function shiftPpEnd(dateStr: string, days: number): string {
  const d = days >= 0 ? addDays(parseISO(dateStr), days) : subDays(parseISO(dateStr), -days);
  return format(d, 'yyyy-MM-dd');
}

function describeEmployee(e: Employee): string {
  const mi = e.middle_initial ? ` ${e.middle_initial}.` : '';
  return `${e.last_name}, ${e.first_name}${mi} — ${e.rank} · ${e.platoon} Platoon · ${e.company_code} · #${e.emp_number}`;
}

interface SubmittedQuery {
  employeeId: string;
  ppEnd: string;
}

export default function Timesheet() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const desktop = isDesktop(bp);

  const [search, setSearch] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [ppEnd, setPpEnd] = useState('');
  const [submitted, setSubmitted] = useState<SubmittedQuery | null>(null);

  const { data: employees, isLoading: employeesLoading, error: employeesError } = useQuery({
    queryKey: ['employees', 'timesheet-picker'],
    queryFn: () => apiGet<Employee[]>('/api/employees', { limit: 500 }),
  });
  const { data: companies } = useCompanies();
  const { data: todayRotation } = useRotation(TODAY);

  // Auto-fill the pay period once, the first time an employee is selected —
  // doesn't re-clobber it on later employee switches (e.g. after the user
  // has navigated to a different period with Prev/Next).
  useEffect(() => {
    if (employeeId && todayRotation?.pp_end && !ppEnd) {
      setPpEnd(todayRotation.pp_end);
    }
  }, [employeeId, todayRotation, ppEnd]);

  const selectedEmployee = employees?.find((e) => e.id === employeeId) ?? null;
  const selectedCompany = companies?.find((c) => c.code === selectedEmployee?.company_code) ?? null;
  const station = selectedEmployee?.station_override ?? selectedCompany?.station_override ?? selectedCompany?.station ?? '—';

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.last_name.toLowerCase().includes(q) ||
        e.first_name.toLowerCase().includes(q) ||
        String(e.emp_number).includes(q)
    );
  }, [employees, search]);

  const groupedByPlatoon = useMemo(() => {
    const groups: Record<Platoon, Employee[]> = { A: [], B: [], C: [] };
    for (const e of filteredEmployees) {
      groups[e.platoon]?.push(e);
    }
    PLATOONS.forEach((p) => groups[p].sort((a, b) => a.last_name.localeCompare(b.last_name)));
    return groups;
  }, [filteredEmployees]);

  const selectEmployee = (emp: Employee) => {
    setEmployeeId(emp.id);
    setSearch(describeEmployee(emp));
    setSubmitted(null);
  };

  const setPpEndAndReset = (value: string) => {
    setPpEnd(value);
    setSubmitted(null);
  };

  const ppStart = ppEnd ? shiftPpEnd(ppEnd, -13) : '';
  const ppRangeLabel =
    ppStart && ppEnd ? `Pay period: ${format(parseISO(ppStart), 'MMM d, yyyy')} → ${format(parseISO(ppEnd), 'MMM d, yyyy')}` : '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['timesheet', submitted?.employeeId, submitted?.ppEnd],
    queryFn: () => apiGet<TimesheetSegment[]>(`/api/timesheet/${submitted!.employeeId}`, { pp_end: submitted!.ppEnd }),
    enabled: submitted !== null,
  });

  const exportMutation = useMutation({
    mutationFn: () => apiPost<{ url: string }>(`/api/timesheet/${submitted!.employeeId}/export`, { pp_end: submitted!.ppEnd }),
    onSuccess: (result) => window.open(result.url, '_blank'),
  });

  const segments = data ?? [];
  const workHours = segments.filter((s) => s.segment_type === 'work').reduce((sum, s) => sum + parseFloat(s.hours), 0);
  const leaveHours = segments.filter((s) => s.segment_type === 'leave').reduce((sum, s) => sum + parseFloat(s.hours), 0);
  const hasLoaded = submitted !== null && !isLoading && !error;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    minHeight: mobile ? MIN_TAP_TARGET : undefined,
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    fontSize: 13,
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: t.textMuted, display: 'block', marginBottom: 4 };
  const navButtonStyle: React.CSSProperties = {
    padding: '8px 14px',
    minHeight: mobile ? MIN_TAP_TARGET : undefined,
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flex: mobile ? '1 1 0' : undefined,
  };

  const cols: RTableColumn<TimesheetSegment>[] = [
    { key: 'dateIn', header: 'Date In', render: (s) => s.date_in ?? '—' },
    { key: 'dateOut', header: 'Date Out', render: (s) => s.date_out ?? '—' },
    { key: 'timeIn', header: 'Time In', render: (s) => s.time_in ?? '—' },
    { key: 'timeOut', header: 'Time Out', render: (s) => s.time_out ?? '—' },
    { key: 'leaveStart', header: 'Leave Start', render: (s) => s.leave_start_date ?? '—', hideAt: [...MOBILE_ONLY_HIDE] },
    { key: 'leaveEnd', header: 'Leave End', render: (s) => s.leave_end_date ?? '—', hideAt: [...MOBILE_ONLY_HIDE] },
    { key: 'leaveIn', header: 'Leave In', render: (s) => s.leave_time_in ?? '—', hideAt: [...MOBILE_ONLY_HIDE] },
    { key: 'leaveOut', header: 'Leave Out', render: (s) => s.leave_time_out ?? '—', hideAt: [...MOBILE_ONLY_HIDE] },
    { key: 'hours', header: 'Hours', render: (s) => parseFloat(s.hours).toFixed(2), numeric: true },
    { key: 'type', header: 'Type', render: (s) => (s.segment_type === 'leave' ? s.leave_type ?? 'Leave' : 'Work') },
  ];

  // ---- left column: employee picker + info card ----
  const employeePicker = (
    <Card t={t}>
      <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Employee</h3>
      <label style={labelStyle}>Search</label>
      <input
        type="text"
        placeholder="Last name, first name, or employee #…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ ...inputStyle, marginBottom: 10 }}
      />

      {employeesLoading && <LoadingSpinner t={t} size={24} />}
      {employeesError && <AlertBar t={t} type="crit">Couldn't load the employee list. Check your connection and reload.</AlertBar>}

      {!employeesLoading && !employeesError && (
        <>
          <label style={labelStyle}>Employee</label>
          <select
            value={employeeId}
            onChange={(e) => {
              const emp = employees?.find((x) => x.id === e.target.value);
              if (emp) selectEmployee(emp);
            }}
            style={inputStyle}
          >
            <option value="">Select an employee…</option>
            {PLATOONS.map(
              (p) =>
                groupedByPlatoon[p].length > 0 && (
                  <optgroup key={p} label={`${p} Platoon`}>
                    {groupedByPlatoon[p].map((e) => (
                      <option key={e.id} value={e.id}>
                        {describeEmployee(e)}
                      </option>
                    ))}
                  </optgroup>
                )
            )}
          </select>
        </>
      )}

      {selectedEmployee && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.border}` }}>
          <InfoRow label="Name" value={`${selectedEmployee.last_name}, ${selectedEmployee.first_name}${selectedEmployee.middle_initial ? ` ${selectedEmployee.middle_initial}.` : ''}`} t={t} />
          <InfoRow label="Rank" value={selectedEmployee.rank} t={t} />
          <InfoRow label="Platoon" value={selectedEmployee.platoon} t={t} />
          <InfoRow label="Company" value={selectedEmployee.company_code} t={t} />
          <InfoRow label="Station" value={station} t={t} />
          <InfoRow label="Emp #" value={String(selectedEmployee.emp_number)} t={t} />
        </div>
      )}
    </Card>
  );

  // ---- right column: pay period + load + results ----
  const rightColumn = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!selectedEmployee && (
        <Card t={t}>
          <p style={{ color: t.textFaint, fontSize: 13, margin: 0 }}>Select an employee above to view their timesheet.</p>
        </Card>
      )}

      {selectedEmployee && (
        <Card t={t}>
          <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Pay Period Ending</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: mobile ? 'stretch' : 'center' }}>
            <button type="button" onClick={() => setPpEndAndReset(shiftPpEnd(ppEnd, -14))} disabled={!ppEnd} style={navButtonStyle}>
              ← Prev PP
            </button>
            <input
              type="date"
              value={ppEnd}
              onChange={(e) => setPpEndAndReset(e.target.value)}
              style={{ ...inputStyle, width: mobile ? '100%' : 180, flex: mobile ? '1 1 100%' : undefined }}
            />
            <button type="button" onClick={() => setPpEndAndReset(shiftPpEnd(ppEnd, 14))} disabled={!ppEnd} style={navButtonStyle}>
              Next PP →
            </button>
          </div>
          {ppRangeLabel && <p style={{ fontSize: 12, color: t.textMuted, marginTop: 10, marginBottom: 14 }}>{ppRangeLabel}</p>}

          <button
            type="button"
            onClick={() => ppEnd && setSubmitted({ employeeId, ppEnd })}
            disabled={!ppEnd || isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 16px',
              minHeight: MIN_TAP_TARGET,
              borderRadius: 6,
              border: 'none',
              background: t.pA,
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              cursor: !ppEnd || isLoading ? 'default' : 'pointer',
              opacity: !ppEnd || isLoading ? 0.6 : 1,
              width: mobile ? '100%' : undefined,
            }}
          >
            {isLoading && <InlineSpinner />}
            {isLoading ? 'Loading…' : 'Load Timesheet'}
          </button>
        </Card>
      )}

      {isLoading && <LoadingSpinner t={t} size={32} />}
      {error && (
        <AlertBar t={t} type="crit">Couldn't build the timesheet. Check the pay period and try again.</AlertBar>
      )}

      {hasLoaded && segments.length === 0 && selectedEmployee && (
        <Card t={t}>
          <p style={{ fontSize: 13, color: t.text, marginTop: 0 }}>
            No duty records found for {selectedEmployee.last_name}, {selectedEmployee.first_name} in pay period{' '}
            {ppStart && format(parseISO(ppStart), 'MMM d, yyyy')} → {ppEnd && format(parseISO(ppEnd), 'MMM d, yyyy')}.
          </p>
          <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 6 }}>This could mean:</p>
          <ul style={{ fontSize: 13, color: t.textMuted, marginTop: 0, paddingLeft: 20 }}>
            <li>No duty ledger has been generated for {selectedEmployee.platoon} Platoon shifts in this period</li>
            <li>This employee was not on the roster for this period</li>
          </ul>
          <Link
            to="/duty-ledger"
            style={{
              display: 'inline-block',
              marginTop: 6,
              fontSize: 13,
              fontWeight: 600,
              color: t.pA,
            }}
          >
            Go to Duty Ledger page to generate records first →
          </Link>
        </Card>
      )}

      {hasLoaded && segments.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 12 }}>
            <MetricCard t={t} label="Segments" value={segments.length} />
            <MetricCard t={t} label="Work Hours" value={workHours.toFixed(2)} />
            <MetricCard t={t} label="Leave Hours" value={leaveHours.toFixed(2)} />
          </div>

          <RTable
            t={t}
            bp={bp}
            cols={cols}
            rows={segments}
            rowKey={(s) => s.id}
            emptyMessage="No timesheet segments for this pay period."
            rowStyle={(s) => (s.segment_type === 'leave' ? { background: t.okBg } : {})}
            footer={(col) => (col.key === 'dateIn' ? 'TOTAL' : col.key === 'hours' ? (workHours + leaveHours).toFixed(2) : '')}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: '1 1 160px' }}>
              <MetricCard t={t} label="Work Hours" value={workHours.toFixed(2)} />
            </div>
            <div style={{ flex: '1 1 160px' }}>
              <MetricCard t={t} label="Leave Hours" value={leaveHours.toFixed(2)} />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                minHeight: MIN_TAP_TARGET,
                borderRadius: 6,
                border: 'none',
                background: t.pA,
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: exportMutation.isPending ? 'default' : 'pointer',
                opacity: exportMutation.isPending ? 0.7 : 1,
                width: mobile ? '100%' : undefined,
              }}
            >
              {exportMutation.isPending && <InlineSpinner />}
              {exportMutation.isPending ? 'Exporting…' : 'Export PDF'}
            </button>
            {exportMutation.isError && (
              <AlertBar t={t} type="crit">PDF generation failed. Try again.</AlertBar>
            )}
          </div>
        </>
      )}
    </div>
  );

  if (desktop) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '30% 1fr', gap: 24, alignItems: 'start' }}>
        <div>{employeePicker}</div>
        <div>{rightColumn}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {employeePicker}
      {rightColumn}
    </div>
  );
}

function InfoRow({ label, value, t }: { label: string; value: string; t: ThemeTokens }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, padding: '3px 0' }}>
      <span style={{ color: t.textMuted }}>{label}</span>
      <span style={{ color: t.text, fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
