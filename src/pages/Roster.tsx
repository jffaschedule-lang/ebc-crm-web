import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint, isMobile, isTablet } from '../hooks/useBreakpoint';
import { apiGet } from '../api/client';
import { Employee, EmployeeStatus, RANK_SENIORITY } from '../types/domain';
import { useMyRole } from '../hooks/useMyRole';
import { useSetEmployeeStatus } from '../hooks/useEmployees';
import { MetricCard } from '../components/ui/MetricCard';
import { LoadingSpinner, InlineSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { RTable, RTableColumn } from '../components/ui/RTable';
import { MobileList } from '../components/ui/MobileList';
import { Card } from '../components/ui/Card';
import { PlatoonChip } from '../components/ui/PlatoonChip';
import { Plate } from '../components/ui/Plate';
import { Avatar } from '../components/ui/Avatar';
import { Pill } from '../components/ui/Pill';
import { Modal } from '../components/ui/Modal';
import { EmployeeForm } from '../components/forms/EmployeeForm';
import { PlusIcon, PencilIcon } from '../components/ui/Icon';
import { MIN_TAP_TARGET } from '../theme/spacing';

type ModalState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; employee: Employee };

export default function Roster() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const tablet = isTablet(bp);

  const [search, setSearch] = useState('');
  const [platoonFilter, setPlatoonFilter] = useState('');
  const [rankFilter, setRankFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | EmployeeStatus>('');
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { isSupervisorOrAdmin } = useMyRole();
  const setStatus = useSetEmployeeStatus();

  const { data, isLoading, error } = useQuery({
    queryKey: ['employees', search, platoonFilter, rankFilter],
    queryFn: () =>
      apiGet<Employee[]>('/api/employees', {
        search: search || undefined,
        platoon: platoonFilter || undefined,
        rank: rankFilter || undefined,
        limit: 200,
      }),
  });

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  if (isLoading) return <LoadingSpinner t={t} size={32} />;
  if (error) return <AlertBar t={t} type="crit">Couldn't load the roster. Check your connection and reload.</AlertBar>;

  const allEmployees = data ?? [];
  const employees = allEmployees.filter((e) => !statusFilter || e.status === statusFilter);

  const active = allEmployees.filter((e) => e.status === 'Active');
  const inactive = allEmployees.filter((e) => e.status === 'Inactive');
  const supervisors = allEmployees.filter((e) => e.supervisor);
  const byPlatoon = (p: string) => allEmployees.filter((e) => e.platoon === p).length;
  const hasFilters = Boolean(search || platoonFilter || rankFilter || statusFilter);

  const handleToggleStatus = (e: Employee) => {
    const nextStatus: EmployeeStatus = e.status === 'Active' ? 'Inactive' : 'Active';
    setStatus.mutate(
      { id: e.id, status: nextStatus },
      { onSuccess: () => setSuccessMessage('Employee status updated') }
    );
  };

  const rowIsPending = (e: Employee) => setStatus.isPending && setStatus.variables?.id === e.id;

  function renderToggleButton(e: Employee) {
    const pending = rowIsPending(e);
    const willDeactivate = e.status === 'Active';
    return (
      <button
        key="toggle"
        type="button"
        onClick={() => handleToggleStatus(e)}
        disabled={pending}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px',
          minHeight: mobile ? MIN_TAP_TARGET : undefined,
          borderRadius: 6,
          border: 'none',
          background: willDeactivate ? t.crit : t.ok,
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          cursor: pending ? 'default' : 'pointer',
          opacity: pending ? 0.7 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {pending && <InlineSpinner size={11} />}
        {willDeactivate ? 'Set Inactive' : 'Set Active'}
      </button>
    );
  }

  function renderEditButton(e: Employee) {
    return (
      <button
        key="edit"
        type="button"
        onClick={() => setModal({ mode: 'edit', employee: e })}
        aria-label={`Edit ${e.first_name} ${e.last_name}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: mobile ? MIN_TAP_TARGET : 30,
          height: mobile ? MIN_TAP_TARGET : 30,
          borderRadius: 6,
          border: `1px solid ${t.border}`,
          background: t.surfaceAlt,
          color: t.textMuted,
          cursor: 'pointer',
        }}
      >
        <PencilIcon size={14} />
      </button>
    );
  }

  const cols: RTableColumn<Employee>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (e) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {e.status === 'Active' && (
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: t.ok, flexShrink: 0 }} />
          )}
          {e.last_name}, {e.first_name}
        </span>
      ),
    },
    { key: 'emp_number', header: '#', render: (e) => e.emp_number, hideAt: ['md'], numeric: true },
    { key: 'rank', header: 'Rank', render: (e) => e.rank },
    { key: 'platoon', header: 'Platoon', render: (e) => <PlatoonChip t={t} platoon={e.platoon} /> },
    { key: 'company', header: 'Company', render: (e) => <Plate t={t} code={e.company_code} />, hideAt: ['md', 'lg'] },
    {
      key: 'status',
      header: 'Status',
      render: (e) =>
        e.status === 'Active' ? (
          <span style={{ color: t.ok }}>Active</span>
        ) : (
          <Pill t={t} color="crit">Inactive</Pill>
        ),
    },
    ...(isSupervisorOrAdmin
      ? [
          {
            key: 'actions',
            header: 'Actions',
            render: (e: Employee) => (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {renderEditButton(e)}
                {renderToggleButton(e)}
              </div>
            ),
          } as RTableColumn<Employee>,
        ]
      : []),
  ];

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr 1fr' : tablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <MetricCard t={t} label="Total" value={allEmployees.length} />
        <MetricCard t={t} label="Active" value={active.length} />
        <MetricCard t={t} label="Inactive" value={inactive.length} />
        <MetricCard t={t} label="Supervisors" value={supervisors.length} />
        <MetricCard t={t} label="Platoon A/B/C" value={`${byPlatoon('A')}/${byPlatoon('B')}/${byPlatoon('C')}`} />
      </div>

      {successMessage && (
        <AlertBar t={t} type="ok">{successMessage}</AlertBar>
      )}
      {setStatus.isError && (
        <AlertBar t={t} type="crit">
          {(setStatus.error as { error?: { message?: string } })?.error?.message ?? 'Failed to update employee status.'}
        </AlertBar>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 180,
            padding: '8px 10px',
            minHeight: mobile ? MIN_TAP_TARGET : undefined,
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
          }}
        />
        {isSupervisorOrAdmin && (
          <button
            type="button"
            onClick={() => setModal({ mode: 'create' })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              minHeight: mobile ? MIN_TAP_TARGET : undefined,
              borderRadius: 6,
              border: 'none',
              background: t.pA,
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flex: mobile ? '1 1 100%' : undefined,
              justifyContent: mobile ? 'center' : undefined,
            }}
          >
            <PlusIcon size={15} />
            Add Employee
          </button>
        )}
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | EmployeeStatus)}
          style={{
            padding: '8px 10px',
            minHeight: mobile ? MIN_TAP_TARGET : undefined,
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
          }}
        >
          <option value="">All Status</option>
          <option value="Active">Active Only</option>
          <option value="Inactive">Inactive Only</option>
        </select>
        <select
          value={rankFilter}
          onChange={(e) => setRankFilter(e.target.value)}
          style={{
            padding: '8px 10px',
            minHeight: mobile ? MIN_TAP_TARGET : undefined,
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
          }}
        >
          <option value="">All ranks</option>
          {RANK_SENIORITY.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {mobile ? (
        <MobileList
          t={t}
          rows={employees}
          rowKey={(e) => e.id}
          emptyMessage={hasFilters ? 'No employees match these filters.' : 'No employees on the roster yet.'}
          rowStyle={(e) => (e.status === 'Inactive' ? { opacity: 0.55 } : {})}
          renderItem={(e) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44 }}>
              <Avatar t={t} name={`${e.first_name} ${e.last_name}`} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: t.text }}>
                  {e.status === 'Active' && (
                    <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: t.ok, flexShrink: 0 }} />
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.last_name}, {e.first_name}</span>
                  {e.status === 'Inactive' && <Pill t={t} color="crit">Inactive</Pill>}
                </div>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{e.rank} · #{e.emp_number}</div>
                {isSupervisorOrAdmin && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {renderEditButton(e)}
                    {renderToggleButton(e)}
                  </div>
                )}
              </div>
              <PlatoonChip t={t} platoon={e.platoon} />
            </div>
          )}
        />
      ) : (
        <RTable
          t={t}
          bp={bp}
          cols={cols}
          rows={employees}
          rowKey={(e) => e.id}
          emptyMessage={hasFilters ? 'No employees match these filters.' : 'No employees on the roster yet.'}
          rowStyle={(e) => (e.status === 'Inactive' ? { opacity: 0.55 } : {})}
        />
      )}

      {!mobile && (
        <Card t={t} style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0 }}>Company → Station Map</h3>
          <p style={{ fontSize: 12, color: t.textMuted }}>
            See the Workforce Report page for the live company-to-station roster and shortage flags.
          </p>
        </Card>
      )}

      {modal.mode !== 'closed' && (
        <Modal t={t} bp={bp} title={modal.mode === 'edit' ? 'Edit Employee' : 'Add Employee'} onClose={() => setModal({ mode: 'closed' })}>
          <EmployeeForm
            t={t}
            bp={bp}
            employee={modal.mode === 'edit' ? modal.employee : undefined}
            onCancel={() => setModal({ mode: 'closed' })}
            onSuccess={(message) => {
              setModal({ mode: 'closed' });
              setSuccessMessage(message);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
