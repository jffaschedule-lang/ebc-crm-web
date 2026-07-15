import { ReactNode } from 'react';
import { ThemeTokens } from '../../theme/tokens';

interface PillProps {
  t: ThemeTokens;
  color: 'green' | 'amber' | 'red' | 'blue';
  children: ReactNode;
}

export function Pill({ t, color, children }: PillProps) {
  const map: Record<PillProps['color'], { fg: string; bg: string }> = {
    green: { fg: t.ok, bg: t.okBg },
    amber: { fg: t.warn, bg: t.warnBg },
    red: { fg: t.crit, bg: t.critBg },
    blue: { fg: t.info, bg: t.infoBg },
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
