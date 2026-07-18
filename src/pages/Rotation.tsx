import { useState } from 'react';
import { format } from 'date-fns';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { useBreakpoint, isMobile } from '../hooks/useBreakpoint';
import { MIN_TAP_TARGET } from '../theme/spacing';
import { useRotation, useRotationPeriod } from '../hooks/useRotation';
import { AlertBar } from '../components/ui/AlertBar';
import { DismissibleInfoBar } from '../components/ui/DismissibleInfoBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { RotationStrip } from '../components/ui/RotationStrip';
import { Card } from '../components/ui/Card';
import { PlatoonChip } from '../components/ui/PlatoonChip';
import { RTable } from '../components/ui/RTable';

const TODAY = format(new Date(), 'yyyy-MM-dd');

export default function Rotation() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const [date, setDate] = useState(TODAY);

  const { data: rotation, isLoading, error } = useRotation(date);
  const { data: periodDays, isLoading: periodLoading } = useRotationPeriod(rotation?.pp_end ?? '');

  return (
    <div>
      <DismissibleInfoBar t={t} storageKey="ebc-legacy-notice-dismissed">
        EBC Workforce CRM — Production system. Duty board data updates automatically every 30 seconds.
      </DismissibleInfoBar>

      <div style={{ marginBottom: 16 }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            padding: '8px 10px',
            minHeight: mobile ? MIN_TAP_TARGET : undefined,
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.surfaceAlt,
            color: t.text,
          }}
        />
      </div>

      {isLoading && <LoadingSpinner t={t} />}
      {error && <AlertBar t={t} type="crit">No rotation entry found for {date}. Check the date or run the rotation seed for this range.</AlertBar>}

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
          <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Full Pay Period</h3>
          <RotationStrip t={t} days={periodDays} todayIso={TODAY} />

          <div style={{ marginTop: 16 }}>
            <RTable
              t={t}
              bp={bp}
              rowKey={(day) => day.shift_date}
              rows={periodDays}
              cols={[
                { key: 'date', header: 'Date', render: (day) => day.shift_date },
                { key: 'platoon', header: 'Platoon', render: (day) => <PlatoonChip t={t} platoon={day.platoon} /> },
              ]}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
