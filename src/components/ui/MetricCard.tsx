import { ThemeTokens } from '../../theme/tokens';

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
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: t.textMuted }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: t.text, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: t.textFaint, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
