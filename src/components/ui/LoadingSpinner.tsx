import { ThemeTokens } from '../../theme/tokens';

interface LoadingSpinnerProps {
  t: ThemeTokens;
  size?: number;
}

export function LoadingSpinner({ t, size = 24 }: LoadingSpinnerProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `3px solid ${t.border}`,
          borderTopColor: t.pA,
          animation: 'ebc-spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes ebc-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
