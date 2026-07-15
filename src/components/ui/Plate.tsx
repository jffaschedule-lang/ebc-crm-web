import { ThemeTokens } from '../../theme/tokens';

interface PlateProps {
  t: ThemeTokens;
  code: string;
}

export function Plate({ t, code }: PlateProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 6px',
        borderRadius: 4,
        border: `1px solid ${t.border}`,
        background: t.surfaceAlt,
        color: t.text,
        letterSpacing: 0.5,
      }}
    >
      {code}
    </span>
  );
}
