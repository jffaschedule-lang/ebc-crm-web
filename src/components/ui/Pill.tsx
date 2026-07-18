import { ReactNode } from 'react';
import { ThemeTokens } from '../../theme/tokens';

export type PillColor = 'ok' | 'warn' | 'crit' | 'info' | 'det' | 'mwa' | 'ot';

interface PillProps {
  t: ThemeTokens;
  color: PillColor;
  children: ReactNode;
}

export function Pill({ t, color, children }: PillProps) {
  const map: Record<PillColor, { fg: string; bg: string }> = {
    ok: { fg: t.ok, bg: t.okBg },
    warn: { fg: t.warn, bg: t.warnBg },
    crit: { fg: t.crit, bg: t.critBg },
    info: { fg: t.info, bg: t.infoBg },
    det: { fg: t.det, bg: t.detBg },
    mwa: { fg: t.mwa, bg: t.mwaBg },
    ot: { fg: t.ot, bg: t.otBg },
  };
  const { fg, bg } = map[color];

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
      {children}
    </span>
  );
}
