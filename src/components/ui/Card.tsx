import { ReactNode } from 'react';
import { ThemeTokens } from '../../theme/tokens';

interface CardProps {
  t: ThemeTokens;
  children: ReactNode;
  style?: React.CSSProperties;
}

export function Card({ t, children, style }: CardProps) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        boxShadow: t.shadow,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
