import { ThemeTokens } from '../../theme/tokens';

interface StatusChipProps {
  t: ThemeTokens;
  status: string;
}

// Maps every EBC duty/leave status code to a semantic (fg, bg) color pair.
function colorsFor(t: ThemeTokens, status: string): { fg: string; bg: string } {
  const map: Record<string, { fg: string; bg: string }> = {
    O: { fg: t.ok, bg: t.okBg },
    AL: { fg: t.info, bg: t.infoBg },
    SL: { fg: t.warn, bg: t.warnBg },
    EAL: { fg: t.warn, bg: t.warnBg },
    ISSL: { fg: t.warn, bg: t.warnBg },
    FODI: { fg: t.crit, bg: t.critBg },
    ADM: { fg: t.textMuted, bg: t.metricBg },
    AWOL: { fg: t.crit, bg: t.critBg },
    FL: { fg: t.info, bg: t.infoBg },
    CT: { fg: t.info, bg: t.infoBg },
    CL: { fg: t.info, bg: t.infoBg },
    DET: { fg: t.pB, bg: t.infoBg },
    MWA: { fg: t.pC, bg: t.okBg },
    OWD: { fg: t.textMuted, bg: t.metricBg },
    PendingApproval: { fg: t.warn, bg: t.warnBg },
    Granted: { fg: t.ok, bg: t.okBg },
    Active: { fg: t.ok, bg: t.okBg },
    Waitlist: { fg: t.warn, bg: t.warnBg },
    Promoted: { fg: t.info, bg: t.infoBg },
    Cancelled: { fg: t.textMuted, bg: t.metricBg },
    Deleted: { fg: t.crit, bg: t.critBg },
  };
  return map[status] ?? { fg: t.textMuted, bg: t.metricBg };
}

export function StatusChip({ t, status }: StatusChipProps) {
  const { fg, bg } = colorsFor(t, status);
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 999,
        color: fg,
        background: bg,
      }}
    >
      {status}
    </span>
  );
}
