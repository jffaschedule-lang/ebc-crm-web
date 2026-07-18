import { ReactNode } from 'react';
import { ThemeTokens } from '../../theme/tokens';
import { AlertTriangleIcon, AlertCircleIcon } from './Icon';

interface AlertBarProps {
  t: ThemeTokens;
  type: 'warn' | 'crit';
  children: ReactNode;
}

export function AlertBar({ t, type, children }: AlertBarProps) {
  const color = type === 'crit' ? t.crit : t.warn;
  const bg = type === 'crit' ? t.critBg : t.warnBg;
  const Icon = type === 'crit' ? AlertCircleIcon : AlertTriangleIcon;

  return (
    <div
      role={type === 'crit' ? 'alert' : 'status'}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        borderLeft: `4px solid ${color}`,
        background: bg,
        color: t.text,
        borderRadius: 6,
        padding: '10px 14px',
        fontSize: 13,
        lineHeight: 1.5,
        marginBottom: 16,
      }}
    >
      <Icon size={16} style={{ color, flexShrink: 0, marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
}
