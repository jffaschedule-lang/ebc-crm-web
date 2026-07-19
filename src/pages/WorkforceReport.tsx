import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useAppStore } from '../store/useAppStore';
import { ThemeTokens, tokensFor } from '../theme/tokens';
import { Breakpoint, useBreakpoint, isMobile } from '../hooks/useBreakpoint';
import { useMyRole } from '../hooks/useMyRole';
import { useCompanies } from '../hooks/useCompanies';
import { useGenerateDutyLedger } from '../hooks/useDutyLedger';
import { useWorkforceReport, WorkforceCompanyReport } from '../hooks/useWorkforce';
import { Company, Platoon } from '../types/domain';
import { LoadingSpinner, InlineSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { Card } from '../components/ui/Card';
import { RTable, RTableColumn } from '../components/ui/RTable';
import { StationCard } from '../components/workforce/StationCard';
import { MIN_TAP_TARGET } from '../theme/spacing';

const TODAY = format(new Date(), 'yyyy-MM-dd');
const DISTRICTS = [120, 140, 160] as const;
type District = (typeof DISTRICTS)[number];
const PLATOONS: Platoon[] = ['A', 'B', 'C'];

function stationNumber(station: string): number {
  const match = station.match(/(\d+)/);
  return match ? Number(match[1]) : 999;
}

function sortByStationThenCode(a: Company, b: Company): number {
  return stationNumber(a.station) - stationNumber(b.station) || a.code.localeCompare(b.code);
}

type View = 'single' | 'all';

export default function WorkforceReport() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const { isSupervisorOrAdmin } = useMyRole();

  const [view, setView] = useState<View>('single');

  const tabs: { id: View; label: string }[] = [
    { id: 'single', label: 'Station Detail' },
    { id: 'all', label: 'All Stations' },
  ];

  return (
    <div>
      {mobile ? (
        <select
          value={view}
          onChange={(e) => setView(e.target.value as View)}
          style={{
            width: '100%',
            padding: '10px 12px',
            minHeight: MIN_TAP_TARGET,
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          {tabs.map((tb) => (
            <option key={tb.id} value={tb.id}>{tb.label}</option>
          ))}
        </select>
      ) : (
        <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${t.border}`, marginBottom: 16 }}>
          {tabs.map((tb) => {
            const active = view === tb.id;
            return (
              <button
                key={tb.id}
                type="button"
                onClick={() => setView(tb.id)}
                aria-pressed={active}
                style={{
                  padding: '10px 16px',
                  minHeight: MIN_TAP_TARGET,
                  border: 'none',
                  borderBottom: `2px solid ${active ? t.pA : 'transparent'}`,
                  background: 'transparent',
                  color: active ? t.text : t.textMuted,
                  fontWeight: active ? 650 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  marginBottom: -1,
                }}
              >
                {tb.label}
              </button>
            );
          })}
        </div>
      )}

      {view === 'single' ? (
        <SingleStationView t={t} bp={bp} isSupervisorOrAdmin={isSupervisorOrAdmin} />
      ) : (
        <AllStationsView t={t} bp={bp} isSupervisorOrAdmin={isSupervisorOrAdmin} />
      )}
    </div>
  );
}

interface ViewProps {
  t: ThemeTokens;
  bp: Breakpoint;
  isSupervisorOrAdmin: boolean;
}

function SingleStationView({ t, bp, isSupervisorOrAdmin }: ViewProps) {
  const mobile = isMobile(bp);
  const { data: companies } = useCompanies();
  const [district, setDistrict] = useState<District>(120);
  const [unit, setUnit] = useState('');
  const [date, setDate] = useState(TODAY);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const generateLedger = useGenerateDutyLedger();

  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(null), 3500);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const unitsInDistrict = useMemo(
    () => (companies ?? []).filter((c) => c.district === district && !c.records_only).sort(sortByStationThenCode),
    [companies, district]
  );

  useEffect(() => {
    if (unitsInDistrict.length > 0 && !unitsInDistrict.some((c) => c.code === unit)) {
      setUnit(unitsInDistrict[0].code);
    }
  }, [unitsInDistrict, unit]);

  const { data, isLoading, error } = useWorkforceReport(date);
  const report = (data ?? []).find((r) => r.company_code === unit) ?? null;

  const controlStyle: React.CSSProperties = {
    padding: '8px 10px',
    minHeight: mobile ? MIN_TAP_TARGET : undefined,
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    fontSize: 13,
    flex: mobile ? '1 1 100%' : undefined,
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <select value={district} onChange={(e) => setDistrict(Number(e.target.value) as District)} style={controlStyle}>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>District {d}</option>
          ))}
        </select>
        <select value={unit} onChange={(e) => setUnit(e.target.value)} style={controlStyle}>
          {unitsInDistrict.map((c) => (
            <option key={c.code} value={c.code}>{c.code} — {c.station}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={controlStyle} />
        {isSupervisorOrAdmin && (
          <button
            type="button"
            onClick={() => generateLedger.mutate(date, { onSuccess: () => setSuccessMsg(`Duty ledger generated for ${date}.`) })}
            disabled={generateLedger.isPending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              minHeight: mobile ? MIN_TAP_TARGET : undefined,
              borderRadius: 6,
              border: 'none',
              background: t.pA,
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: generateLedger.isPending ? 'default' : 'pointer',
              opacity: generateLedger.isPending ? 0.7 : 1,
              flex: mobile ? '1 1 100%' : undefined,
            }}
          >
            {generateLedger.isPending && <InlineSpinner size={11} />}
            {generateLedger.isPending ? 'Generating…' : 'Generate ledger'}
          </button>
        )}
      </div>

      {successMsg && <AlertBar t={t} type="ok">{successMsg}</AlertBar>}
      {generateLedger.isError && (
        <AlertBar t={t} type="crit">
          {(generateLedger.error as { error?: { message?: string } })?.error?.message ?? 'Failed to generate duty ledger.'}
        </AlertBar>
      )}

      {isLoading && <LoadingSpinner t={t} size={32} />}
      {error && <AlertBar t={t} type="crit">Couldn't load the workforce report. Check your connection and reload.</AlertBar>}

      {!isLoading && !error && !report && unit && (
        <p style={{ color: t.textFaint, fontSize: 13 }}>No report available for {unit} on {date}.</p>
      )}
      {!isLoading && !error && report && <StationCard t={t} bp={bp} report={report} />}
    </div>
  );
}

function AllStationsView({ t, bp, isSupervisorOrAdmin }: ViewProps) {
  const mobile = isMobile(bp);
  const [platoon, setPlatoon] = useState<Platoon>('A');
  const [date, setDate] = useState(TODAY);
  const [districtFilter, setDistrictFilter] = useState<'all' | District>('all');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const generateLedger = useGenerateDutyLedger();

  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(null), 3500);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const { data, isLoading, error } = useWorkforceReport(date, platoon);
  const report = data ?? [];
  const filtered = districtFilter === 'all' ? report : report.filter((r) => r.district === districtFilter);
  const districtsToShow = DISTRICTS.filter((d) => districtFilter === 'all' || d === districtFilter);

  const companiesByCode = useMemo(() => new Map(filtered.map((r) => [r.company_code, r])), [filtered]);

  const controlStyle: React.CSSProperties = {
    padding: '8px 10px',
    minHeight: mobile ? MIN_TAP_TARGET : undefined,
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    fontSize: 13,
    flex: mobile ? '1 1 100%' : undefined,
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <select value={platoon} onChange={(e) => setPlatoon(e.target.value as Platoon)} style={controlStyle}>
          {PLATOONS.map((p) => (
            <option key={p} value={p}>Platoon {p}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={controlStyle} />
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as District))}
          style={controlStyle}
        >
          <option value="all">All Districts</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>District {d}</option>
          ))}
        </select>
        {isSupervisorOrAdmin && (
          <button
            type="button"
            onClick={() => generateLedger.mutate(date, { onSuccess: () => setSuccessMsg(`Duty ledger generated for ${date}.`) })}
            disabled={generateLedger.isPending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              minHeight: mobile ? MIN_TAP_TARGET : undefined,
              borderRadius: 6,
              border: 'none',
              background: t.pA,
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: generateLedger.isPending ? 'default' : 'pointer',
              opacity: generateLedger.isPending ? 0.7 : 1,
              flex: mobile ? '1 1 100%' : undefined,
            }}
          >
            {generateLedger.isPending && <InlineSpinner size={11} />}
            {generateLedger.isPending ? 'Generating…' : 'Generate all'}
          </button>
        )}
      </div>

      {successMsg && <AlertBar t={t} type="ok">{successMsg}</AlertBar>}
      {generateLedger.isError && (
        <AlertBar t={t} type="crit">
          {(generateLedger.error as { error?: { message?: string } })?.error?.message ?? 'Failed to generate duty ledger.'}
        </AlertBar>
      )}

      {isLoading && <LoadingSpinner t={t} size={32} />}
      {error && <AlertBar t={t} type="crit">Couldn't load the workforce report. Check your connection and reload.</AlertBar>}

      {!isLoading && !error && report.length === 0 && (
        <p style={{ color: t.textFaint, fontSize: 13, marginBottom: 20 }}>No companies configured yet.</p>
      )}

      {!isLoading && !error && report.length > 0 && (
        <>
          {districtsToShow.map((d) => {
            const inDistrict = Array.from(companiesByCode.values())
              .filter((r) => r.district === d)
              .sort((a, b) => a.station.localeCompare(b.station) || a.company_code.localeCompare(b.company_code));
            if (inDistrict.length === 0) return null;
            return (
              <div key={d} style={{ marginBottom: 24 }}>
                <h3
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    color: t.textMuted,
                    marginBottom: 10,
                  }}
                >
                  District {d}
                </h3>
                {inDistrict.map((r) => (
                  <StationCard key={r.company_code} t={t} bp={bp} report={r} />
                ))}
              </div>
            );
          })}

          <DistrictSummaryTable t={t} bp={bp} report={filtered} />
        </>
      )}
    </div>
  );
}

interface DistrictTotals {
  district: number;
  companies: number;
  assigned: number;
  onDuty: number;
  detOut: number;
  mwa: number;
  ot: number;
  shortage: number;
}

function DistrictSummaryTable({ t, bp, report }: { t: ThemeTokens; bp: Breakpoint; report: WorkforceCompanyReport[] }) {
  const rows: DistrictTotals[] = useMemo(() => {
    const districts = Array.from(new Set(report.map((r) => r.district).filter((d): d is number => d != null))).sort((a, b) => a - b);
    return districts.map((d) => {
      const inDistrict = report.filter((r) => r.district === d);
      return {
        district: d,
        companies: inDistrict.length,
        assigned: inDistrict.reduce((s, r) => s + r.total_assigned, 0),
        onDuty: inDistrict.reduce((s, r) => s + r.on_duty_count, 0),
        detOut: inDistrict.reduce((s, r) => s + r.det_out, 0),
        mwa: inDistrict.reduce((s, r) => s + r.mwa_count, 0),
        ot: inDistrict.reduce((s, r) => s + r.ot_count, 0),
        shortage: inDistrict.reduce((s, r) => s + r.shortage, 0),
      };
    });
  }, [report]);

  const totals: DistrictTotals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          district: 0,
          companies: acc.companies + r.companies,
          assigned: acc.assigned + r.assigned,
          onDuty: acc.onDuty + r.onDuty,
          detOut: acc.detOut + r.detOut,
          mwa: acc.mwa + r.mwa,
          ot: acc.ot + r.ot,
          shortage: acc.shortage + r.shortage,
        }),
        { district: 0, companies: 0, assigned: 0, onDuty: 0, detOut: 0, mwa: 0, ot: 0, shortage: 0 }
      ),
    [rows]
  );

  const cols: RTableColumn<DistrictTotals>[] = [
    { key: 'district', header: 'District', render: (r) => r.district },
    { key: 'companies', header: 'Companies', numeric: true, render: (r) => r.companies },
    { key: 'assigned', header: 'Assigned', numeric: true, render: (r) => r.assigned },
    { key: 'onDuty', header: 'On Duty', numeric: true, render: (r) => r.onDuty },
    { key: 'detOut', header: 'DET out', numeric: true, render: (r) => r.detOut },
    { key: 'mwa', header: 'MWA', numeric: true, render: (r) => r.mwa },
    { key: 'ot', header: 'OT', numeric: true, render: (r) => r.ot },
    { key: 'shortage', header: 'Shortage', numeric: true, render: (r) => r.shortage },
  ];

  return (
    <Card t={t}>
      <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>District Summary</h3>
      <RTable
        t={t}
        bp={bp}
        cols={cols}
        rows={rows}
        rowKey={(r) => String(r.district)}
        emptyMessage="No district data for this date."
        footer={(col) => {
          if (rows.length === 0) return '';
          switch (col.key) {
            case 'district': return 'TOTAL';
            case 'companies': return totals.companies;
            case 'assigned': return totals.assigned;
            case 'onDuty': return totals.onDuty;
            case 'detOut': return totals.detOut;
            case 'mwa': return totals.mwa;
            case 'ot': return totals.ot;
            case 'shortage': return totals.shortage;
            default: return '';
          }
        }}
      />
    </Card>
  );
}
