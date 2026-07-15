import { useState } from 'react';
import { format } from 'date-fns';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useRotation, useRotationPeriod } from '../hooks/useRotation';
import { AlertBar } from '../components/ui/AlertBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { RotationStrip } from '../components/ui/RotationStrip';
import { Card } from '../components/ui/Card';
import { PlatoonChip } from '../components/ui/PlatoonChip';

const TODAY = format(new Date(), 'yyyy-MM-dd');

export default function Rotation() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const [date, setDate] = useState(TODAY);

  const { data: rotation, isLoading, error } = useRotation(date);
  const { data: periodDays, isLoading: periodLoading } = useRotationPeriod(rotation?.pp_end ?? '');

  return (
    <div>
      <AlertBar t={t} type="warn">
        All rotation answers come from the backend rotationService — never computed client-side.
      </AlertBar>

      <div style={{ marginBottom: 16 }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            padding: '8px 10px',
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
          }}
        />
      </div>

      {isLoading && <LoadingSpinner t={t} />}
      {error && <AlertBar t={t} type="crit">No rotation entry found for {date}.</AlertBar>}

      {rotation && (
        <Card t={t} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PlatoonChip t={t} platoon={rotation.platoon} />
            <div>
              <div style={{ fontSize: 14, color: t.text }}>Platoon {rotation.platoon} on duty</div>
              <div style={{ fontSize: 12, color: t.textMuted }}>
                Pay period {rotation.pp_start} → {rotation.pp_end}
              </div>
            </div>
          </div>
        </Card>
      )}

      {!periodLoading && periodDays && periodDays.length > 0 && (
        <Card t={t}>
          <h3 style={{ fontSize: 13, color: t.text, marginTop: 0, marginBottom: 10 }}>Full Pay Period</h3>
          <RotationStrip t={t} days={periodDays} todayIso={TODAY} />

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 16 }}>
            <thead>
              <tr style={{ background: t.surfaceAlt }}>
                <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: t.textMuted }}>Date</th>
                <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: t.textMuted }}>Platoon</th>
              </tr>
            </thead>
            <tbody>
              {periodDays.map((day) => (
                <tr key={day.shift_date} style={{ borderTop: `1px solid ${t.border}` }}>
                  <td style={{ padding: 8, color: t.text }}>{day.shift_date}</td>
                  <td style={{ padding: 8 }}>
                    <PlatoonChip t={t} platoon={day.platoon} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
