import { ThemeTokens } from '../../theme/tokens';

interface PlatoonChipProps {
  t: ThemeTokens;
  platoon: 'A' | 'B' | 'C';
}

export function PlatoonChip({ t, platoon }: PlatoonChipProps) {
  const color = platoon === 'A' ? t.pA : platoon === 'B' ? t.pB : t.pC;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {platoon}
    </span>
  );
}
