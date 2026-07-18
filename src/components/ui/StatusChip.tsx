import { ThemeTokens } from '../../theme/tokens';

// Maps every EBC duty/leave status code to a semantic (fg, bg) color pair.
// Text label is always shown alongside color — status is never color-alone
// (WCAG 1.4.1). The 7 primary hues (O/Train/AL/SL/DET/MWA/OT) keep the same
// meaning across all 3 themes; secondary leave codes bucket onto the closest
// semantic category.
function colorsFor(t: ThemeTokens, status: string): { fg: string; bg: string } {
  const map: Record<string, { fg: string; bg: string }> = {
    O: { fg: t.ok, bg: t.okBg },
    Train: { fg: t.train, bg: t.trainBg },
    AL: { fg: t.info, bg: t.infoBg },
    SL: { fg: t.warn, bg: t.warnBg },
    EAL: { fg: t.info, bg: t.infoBg },
    ISSL: { fg: t.crit, bg: t.critBg },
    FODI: { fg: t.crit, bg: t.critBg },
    ADM: { fg: t.textMuted, bg: t.metricBg },
    AWOL: { fg: t.crit, bg: t.critBg },
    FL: { fg: t.info, bg: t.infoBg },
    CT: { fg: t.info, bg: t.infoBg },
    CL: { fg: t.info, bg: t.infoBg },
    DET: { fg: t.det, bg: t.detBg },
    MWA: { fg: t.mwa, bg: t.mwaBg },
    OT: { fg: t.ot, bg: t.otBg },
    OWD: { fg: t.textMuted, bg: t.metricBg },
    PendingApproval: { fg: t.warn, bg: t.warnBg },
    Granted: { fg: t.ok, bg: t.okBg },
    Active: { fg: t.ok, bg: t.okBg },
    Waitlist: { fg: t.warn, bg: t.warnBg },
    Promoted: { fg: t.info, bg: t.infoBg },
    Cancelled: { fg: t.textMuted, bg: t.metricBg },
    Deleted: { fg: t.crit, bg: t.critBg },
    Approved: { fg: t.ok, bg: t.okBg },
    Denied: { fg: t.crit, bg: t.critBg },
  };
  return map[status] ?? { fg: t.textMuted, bg: t.metricBg };
}

interface StatusChipProps {
  t: ThemeTokens;
  status: string;
}

export function StatusChip({ t, status }: StatusChipProps) {
  const { fg, bg } = colorsFor(t, status);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 999,
        color: fg,
        background: bg,
        whiteSpace: 'nowrap',
      }}
    >
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: fg, flexShrink: 0 }} />
      {status}
    </span>
  );
}
