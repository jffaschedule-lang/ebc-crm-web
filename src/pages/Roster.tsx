import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint, isMobile, isTablet } from '../hooks/useBreakpoint';
import { apiGet } from '../api/client';
import { Employee, RANK_SENIORITY } from '../types/domain';
import { MetricCard } from '../components/ui/MetricCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { RTable, RTableColumn } from '../components/ui/RTable';
import { MobileList } from '../components/ui/MobileList';
import { Card } from '../components/ui/Card';
import { PlatoonChip } from '../components/ui/PlatoonChip';
import { Plate } from '../components/ui/Plate';
import { Avatar } from '../components/ui/Avatar';

export default function Roster() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const tablet = isTablet(bp);

  const [search, setSearch] = useState('');
  const [platoonFilter, setPlatoonFilter] = useState('');
  const [rankFilter, setRankFilter] = useState('');

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

  if (isLoading) return <LoadingSpinner t={t} size={32} />;
  if (error) return <AlertBar t={t} type="crit">Couldn't load the roster. Check your connection and reload.</AlertBar>;

  const employees = data ?? [];
  const active = employees.filter((e) => e.status === 'Active');
  const supervisors = employees.filter((e) => e.supervisor);
  const byPlatoon = (p: string) => employees.filter((e) => e.platoon === p).length;
  const hasFilters = Boolean(search || platoonFilter || rankFilter);

  const cols: RTableColumn<Employee>[] = [
    { key: 'name', header: 'Name', render: (e) => `${e.last_name}, ${e.first_name}` },
    { key: 'emp_number', header: '#', render: (e) => e.emp_number, hideAt: ['md'], numeric: true },
    { key: 'rank', header: 'Rank', render: (e) => e.rank },
    { key: 'platoon', header: 'Platoon', render: (e) => <PlatoonChip t={t} platoon={e.platoon} /> },
    { key: 'company', header: 'Company', render: (e) => <Plate t={t} code={e.company_code} />, hideAt: ['md', 'lg'] },
    {
      key: 'status',
      header: 'Status',
      render: (e) => <span style={{ color: e.status === 'Active' ? t.ok : t.textFaint }}>{e.status}</span>,
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr 1fr' : tablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <MetricCard t={t} label="Total" value={employees.length} />
        <MetricCard t={t} label="Active" value={active.length} />
        <MetricCard t={t} label="Supervisors" value={supervisors.length} />
        <MetricCard t={t} label="Platoon A/B/C" value={`${byPlatoon('A')}/${byPlatoon('B')}/${byPlatoon('C')}`} />
      </div>

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
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
          }}
        />
        <select
          value={platoonFilter}
          onChange={(e) => setPlatoonFilter(e.target.value)}
          style={{
            padding: '8px 10px',
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
          value={rankFilter}
          onChange={(e) => setRankFilter(e.target.value)}
          style={{
            padding: '8px 10px',
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
          renderItem={(e) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44 }}>
              <Avatar t={t} name={`${e.first_name} ${e.last_name}`} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: t.text }}>{e.last_name}, {e.first_name}</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>{e.rank} · #{e.emp_number}</div>
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
    </div>
  );
}
