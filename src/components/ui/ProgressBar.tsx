import { ThemeTokens } from '../../theme/tokens';

interface ProgressBarProps {
  t: ThemeTokens;
  percent: number; // 0-100
}

function colorForPercent(t: ThemeTokens, percent: number): string {
  if (percent >= 100) return t.ok;
  if (percent >= 75) return t.warn;
  return t.crit;
}

export function ProgressBar({ t, percent }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div style={{ background: t.metricBg, borderRadius: 999, height: 8, overflow: 'hidden' }}>
      <div
        style={{
          width: `${clamped}%`,
          height: '100%',
          background: colorForPercent(t, clamped),
          transition: 'width 0.2s ease',
        }}
      />
    </div>
  );
}
