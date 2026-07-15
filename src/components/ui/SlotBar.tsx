import { ThemeTokens } from '../../theme/tokens';

interface SlotBarProps {
  t: ThemeTokens;
  occupied: number;
  maxSlots?: number;
  /** True while the currently-drafted request would occupy one more slot. */
  pendingFit?: boolean;
}

export function SlotBar({ t, occupied, maxSlots = 12, pendingFit }: SlotBarProps) {
  const slots = Array.from({ length: maxSlots }, (_, i) => i);

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {slots.map((i) => {
        let bg = t.metricBg;
        if (i < occupied) bg = t.crit;
        else if (pendingFit && i === occupied) bg = t.warn;

        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 20,
              borderRadius: 4,
              background: bg,
              border: `1px solid ${t.border}`,
            }}
          />
        );
      })}
    </div>
  );
}
