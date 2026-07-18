import { ThemeTokens } from '../../theme/tokens';
import { FONT_MONO } from '../../theme/typography';

interface MetricCardProps {
  t: ThemeTokens;
  label: string;
  value: string | number;
  sub?: string;
}

export function MetricCard({ t, label, value, sub }: MetricCardProps) {
  return (
    <div
      style={{
        background: t.metricBg,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        padding: '14px 16px',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: t.textMuted }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: t.text,
          marginTop: 4,
          fontFamily: FONT_MONO,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: t.textFaint, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
