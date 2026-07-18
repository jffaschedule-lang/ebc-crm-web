import { ReactNode } from 'react';
import { ThemeTokens } from '../../theme/tokens';
import { AlertTriangleIcon, AlertCircleIcon, CheckCircleIcon } from './Icon';

interface AlertBarProps {
  t: ThemeTokens;
  type: 'warn' | 'crit' | 'ok';
  children: ReactNode;
}

export function AlertBar({ t, type, children }: AlertBarProps) {
  const color = type === 'crit' ? t.crit : type === 'ok' ? t.ok : t.warn;
  const bg = type === 'crit' ? t.critBg : type === 'ok' ? t.okBg : t.warnBg;
  const Icon = type === 'crit' ? AlertCircleIcon : type === 'ok' ? CheckCircleIcon : AlertTriangleIcon;

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
