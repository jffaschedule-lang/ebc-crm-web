import { useState } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { apiGet } from '../api/client';
import { ShiftClose as ShiftCloseType } from '../types/domain';
import { Card } from '../components/ui/Card';
import { StatusChip } from '../components/ui/StatusChip';
import { ShiftCloseForm } from '../components/forms/ShiftCloseForm';

const TODAY = format(new Date(), 'yyyy-MM-dd');

export default function ShiftClose() {
  const theme = useAppStore((s) => s.theme);
  const t = tokensFor(theme);

  const [date, setDate] = useState(TODAY);
  const [station, setStation] = useState('');
  const [platoon, setPlatoon] = useState<'A' | 'B' | 'C'>('A');

  const { data: closeStatus } = useQuery({
    queryKey: ['shift-close', date, station],
    queryFn: () => apiGet<ShiftCloseType | null>(`/api/shift-close/date/${date}/station/${station}`),
    enabled: Boolean(date) && Boolean(station),
  });

  const inputStyle: React.CSSProperties = {
    padding: '8px 10px',
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        <input
          type="text"
          placeholder="Station (e.g. Station 8)"
          value={station}
          onChange={(e) => setStation(e.target.value)}
          style={{ ...inputStyle, minWidth: 180 }}
        />
        <select value={platoon} onChange={(e) => setPlatoon(e.target.value as 'A' | 'B' | 'C')} style={inputStyle}>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>

      {closeStatus && (
        <Card t={t} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: t.text }}>Shift already closed</span>
            <StatusChip t={t} status={closeStatus.packet_sent_at ? 'Granted' : 'PendingApproval'} />
          </div>
        </Card>
      )}

      {station && (
        <Card t={t}>
          <h3 style={{ fontSize: 13, color: t.text, marginTop: 0, marginBottom: 10 }}>
            Close Shift — {station} — {date}
          </h3>
          <ShiftCloseForm t={t} shiftDate={date} station={station} platoon={platoon} />
        </Card>
      )}
    </div>
  );
}
