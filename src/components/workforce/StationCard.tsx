import { ThemeTokens } from '../../theme/tokens';
import { Breakpoint } from '../../hooks/useBreakpoint';
import { WorkforceCompanyReport, WorkforceEmployeeDetail } from '../../hooks/useWorkforce';
import { Card } from '../ui/Card';
import { Plate } from '../ui/Plate';
import { RTable, RTableColumn } from '../ui/RTable';

// This page recreates the legacy "NEW WORKFORCE" Google Sheet tab's own
// color convention (gray O, blue DET, etc.) rather than the app-wide
// duty-status hue system used everywhere else (StatusChip.tsx) — deliberate,
// since staff already read this exact layout from years of the sheet. Still
// sourced entirely from theme tokens, just a different token per status than
// the rest of the app uses.
function statusColorsFor(t: ThemeTokens, status: string): { fg: string; bg: string } {
  const map: Record<string, { fg: string; bg: string }> = {
    O: { fg: t.textMuted, bg: t.metricBg },
    AL: { fg: t.ok, bg: t.okBg },
    SL: { fg: t.warn, bg: t.warnBg },
    ISSL: { fg: t.warn, bg: t.warnBg },
    DET: { fg: t.info, bg: t.infoBg },
    MWA: { fg: t.ok, bg: t.okBg },
    FODI: { fg: t.crit, bg: t.critBg },
  };
  return map[status] ?? { fg: t.textMuted, bg: t.metricBg };
}

function StatusPill({ t, status }: { t: ThemeTokens; status: string }) {
  const { fg, bg } = statusColorsFor(t, status);
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 999,
        color: fg,
        background: bg,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}

function FlagTags({ t, e }: { t: ThemeTokens; e: WorkforceEmployeeDetail }) {
  const tags: { label: string; fg: string; bg: string }[] = [];
  if (e.det_flag) tags.push({ label: 'DET', fg: t.info, bg: t.infoBg });
  if (e.mwa_flag) tags.push({ label: 'MWA', fg: t.ok, bg: t.okBg });
  if (e.ot_flag) tags.push({ label: 'OT', fg: t.warn, bg: t.warnBg });

  if (tags.length === 0) return <span style={{ color: t.textFaint }}>—</span>;

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {tags.map((tag) => (
        <span
          key={tag.label}
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '1px 6px',
            borderRadius: 4,
            color: tag.fg,
            background: tag.bg,
            whiteSpace: 'nowrap',
          }}
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
}

interface StationCardProps {
  t: ThemeTokens;
  bp: Breakpoint;
  report: WorkforceCompanyReport;
}

export function StationCard({ t, bp, report }: StationCardProps) {
  const percent = (report.on_duty_count / Math.max(1, report.required_seats)) * 100;
  const shortfall = Math.max(0, report.required_seats - report.on_duty_count);
  // Green if full, amber if 1 short, red if 2+ short.
  const counterColor = shortfall === 0 ? t.ok : shortfall === 1 ? t.warn : t.crit;
  const counterBg = shortfall === 0 ? t.okBg : shortfall === 1 ? t.warnBg : t.critBg;

  const cols: RTableColumn<WorkforceEmployeeDetail>[] = [
    { key: 'empNumber', header: 'Emp #', render: (e) => e.emp_number, numeric: true },
    { key: 'rank', header: 'Rank', render: (e) => e.rank },
    { key: 'name', header: 'Name', render: (e) => `${e.last_name}, ${e.first_name}` },
    { key: 'status', header: 'Status', render: (e) => <StatusPill t={t} status={e.duty_status} /> },
    { key: 'flags', header: 'Flags', render: (e) => <FlagTags t={t} e={e} /> },
    { key: 'notes', header: 'Notes', render: (e) => e.notes ?? '—', hideAt: ['xs', 'sm'] },
  ];

  return (
    <Card t={t} style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Plate t={t} code={report.company_code} />
          <span style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>{report.station}</span>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 999,
            color: counterColor,
            background: counterBg,
            whiteSpace: 'nowrap',
          }}
        >
          {report.on_duty_count}/{report.required_seats} seats filled
        </span>
      </div>

      <div style={{ background: t.metricBg, borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: 14 }}>
        <div
          style={{
            width: `${Math.max(0, Math.min(100, percent))}%`,
            height: '100%',
            background: counterColor,
            transition: 'width 0.2s ease',
          }}
        />
      </div>

      <RTable
        t={t}
        bp={bp}
        cols={cols}
        rows={report.employees}
        rowKey={(e) => e.employee_id}
        emptyMessage="No one assigned to this station for this date."
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12, fontSize: 12, color: t.textMuted }}>
        <span>
          On duty <strong style={{ color: t.text }}>{report.on_duty_count}</strong>
        </span>
        <span>
          DET out <strong style={{ color: t.text }}>{report.det_out}</strong>
        </span>
        <span>
          MWA <strong style={{ color: t.text }}>{report.mwa_count}</strong>
        </span>
        <span>
          OT <strong style={{ color: t.text }}>{report.ot_count}</strong>
        </span>
      </div>
    </Card>
  );
}
