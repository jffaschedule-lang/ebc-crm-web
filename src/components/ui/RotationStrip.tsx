import { format, parseISO } from 'date-fns';
import { ThemeTokens } from '../../theme/tokens';
import { RotationDay } from '../../types/domain';

interface RotationStripProps {
  t: ThemeTokens;
  days: RotationDay[];
  todayIso: string;
}

export function RotationStrip({ t, days, todayIso }: RotationStripProps) {
  const platoonColor = (p: string) => (p === 'A' ? t.pA : p === 'B' ? t.pB : t.pC);
  const ppEnd = days[days.length - 1]?.pp_end;

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
        {days.map((day) => {
          const isToday = day.shift_date === todayIso;
          return (
            <div
              key={day.shift_date}
              title={`${day.shift_date} · Platoon ${day.platoon}`}
              style={{
                minWidth: 40,
                flexShrink: 0,
                borderRadius: 6,
                textAlign: 'center',
                padding: '6px 4px',
                background: platoonColor(day.platoon),
                color: '#fff',
                fontSize: 11,
                outline: isToday ? `2px solid ${t.warn}` : 'none',
                outlineOffset: 1,
              }}
            >
              <div style={{ fontWeight: 700 }}>{day.platoon}</div>
              <div style={{ fontSize: 9, opacity: 0.85 }}>{format(parseISO(day.shift_date), 'MM/dd')}</div>
            </div>
          );
        })}
      </div>
      {ppEnd && (
        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6 }}>
          PP END: {format(parseISO(ppEnd), 'MMM d, yyyy')}
        </div>
      )}
    </div>
  );
}
