import { ReactNode } from 'react';
import { ThemeTokens } from '../../theme/tokens';

interface AlertBarProps {
  t: ThemeTokens;
  type: 'warn' | 'crit';
  children: ReactNode;
}

export function AlertBar({ t, type, children }: AlertBarProps) {
  const color = type === 'crit' ? t.crit : t.warn;
  const bg = type === 'crit' ? t.critBg : t.warnBg;

  return (
    <div
      style={{
        borderLeft: `4px solid ${color}`,
        background: bg,
        color: t.text,
        borderRadius: 6,
        padding: '10px 14px',
        fontSize: 13,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}
