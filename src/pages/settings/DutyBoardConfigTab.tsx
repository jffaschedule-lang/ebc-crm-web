import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ThemeTokens } from '../../theme/tokens';
import { Breakpoint, isMobile } from '../../hooks/useBreakpoint';
import { apiGet, apiPatch } from '../../api/client';
import { useSystemInfo } from '../../hooks/useAdmin';
import { useGenerateDutyLedger } from '../../hooks/useDutyLedger';
import { Setting } from '../../types/domain';
import { Card } from '../../components/ui/Card';
import { AlertBar } from '../../components/ui/AlertBar';
import { LoadingSpinner, InlineSpinner } from '../../components/ui/LoadingSpinner';
import { MIN_TAP_TARGET } from '../../theme/spacing';

interface TabProps {
  t: ThemeTokens;
  bp: Breakpoint;
}

const TODAY = format(new Date(), 'yyyy-MM-dd');

export function DutyBoardConfigTab({ t, bp }: TabProps) {
  const mobile = isMobile(bp);
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiGet<Setting[]>('/api/settings'),
  });
  const { data: systemInfo, isLoading: infoLoading } = useSystemInfo();
  const generateLedger = useGenerateDutyLedger();

  const shiftStartSetting = settings?.find((s) => s.key === 'shift_start_time');
  const alSlotsSetting = settings?.find((s) => s.key === 'max_al_slots_per_shift');
  const autoGenSetting = settings?.find((s) => s.key === 'auto_generate_duty_ledger');

  const [shiftStartDraft, setShiftStartDraft] = useState('');
  const [alSlotsDraft, setAlSlotsDraft] = useState('');
  const [genDate, setGenDate] = useState(TODAY);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (shiftStartSetting) setShiftStartDraft(shiftStartSetting.value);
  }, [shiftStartSetting]);
  useEffect(() => {
    if (alSlotsSetting) setAlSlotsDraft(alSlotsSetting.value);
  }, [alSlotsSetting]);

  useEffect(() => {
    if (!genSuccess) return;
    const timer = setTimeout(() => setGenSuccess(null), 3500);
    return () => clearTimeout(timer);
  }, [genSuccess]);

  const saveSetting = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => apiPatch(`/api/settings/${key}`, { value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const inputStyle: React.CSSProperties = {
    padding: '8px 10px',
    minHeight: mobile ? MIN_TAP_TARGET : undefined,
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    fontSize: 13,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: mobile ? 'column' : 'row',
    gap: 10,
    alignItems: mobile ? 'stretch' : 'center',
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: t.textMuted, minWidth: 180 };

  const autoGenOn = autoGenSetting?.value === 'true';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 17, fontWeight: 650, color: t.text, margin: 0 }}>Duty Board &amp; Shift Configuration</h2>

      <Card t={t}>
        {(isLoading || infoLoading) && <LoadingSpinner t={t} />}
        {!isLoading && !infoLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={rowStyle}>
              <label style={labelStyle}>Shift start time</label>
              <input type="time" value={shiftStartDraft} onChange={(e) => setShiftStartDraft(e.target.value)} style={inputStyle} />
              <button
                type="button"
                onClick={() => saveSetting.mutate({ key: 'shift_start_time', value: shiftStartDraft })}
                disabled={saveSetting.isPending}
                style={{ padding: '8px 16px', minHeight: mobile ? MIN_TAP_TARGET : undefined, borderRadius: 6, border: 'none', background: t.pA, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                Save
              </button>
            </div>

            <div style={rowStyle}>
              <label style={labelStyle}>AL slots per shift</label>
              <input
                type="number"
                min={0}
                value={alSlotsDraft}
                onChange={(e) => setAlSlotsDraft(e.target.value)}
                style={{ ...inputStyle, width: mobile ? undefined : 100 }}
              />
              <button
                type="button"
                onClick={() => saveSetting.mutate({ key: 'max_al_slots_per_shift', value: alSlotsDraft })}
                disabled={saveSetting.isPending}
                style={{ padding: '8px 16px', minHeight: mobile ? MIN_TAP_TARGET : undefined, borderRadius: 6, border: 'none', background: t.pA, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                Save
              </button>
            </div>

            <div style={rowStyle}>
              <label style={labelStyle}>Auto-generate duty ledger</label>
              <button
                type="button"
                role="switch"
                aria-checked={autoGenOn}
                onClick={() => saveSetting.mutate({ key: 'auto_generate_duty_ledger', value: autoGenOn ? 'false' : 'true' })}
                disabled={saveSetting.isPending || !autoGenSetting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  width: 44,
                  height: 24,
                  padding: 2,
                  borderRadius: 999,
                  border: 'none',
                  background: autoGenOn ? t.ok : t.border,
                  cursor: 'pointer',
                  transition: 'background 120ms ease',
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    transform: autoGenOn ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 120ms ease',
                    display: 'block',
                  }}
                />
              </button>
              <span style={{ fontSize: 12, color: autoGenOn ? t.ok : t.textFaint, fontWeight: 600 }}>{autoGenOn ? 'ON' : 'OFF'}</span>
            </div>
            <p style={{ fontSize: 11, color: t.textFaint, margin: 0, marginTop: -8 }}>
              When ON, the duty ledger auto-generates at shift start time (requires the generate-duty-ledger cron job
              to be scheduled against <code>POST /api/jobs/generate-duty-ledger</code>).
            </p>

            <div style={rowStyle}>
              <label style={labelStyle}>Rotation data range</label>
              <span style={{ fontSize: 13, color: t.text }}>
                {systemInfo?.rotationRange.start && systemInfo?.rotationRange.end
                  ? `${systemInfo.rotationRange.start} to ${systemInfo.rotationRange.end} — ${systemInfo.rotationRange.days.toLocaleString()} days`
                  : 'No rotation data generated yet.'}
              </span>
            </div>

            {saveSetting.isSuccess && <AlertBar t={t} type="ok">Setting saved.</AlertBar>}
            {saveSetting.isError && (
              <AlertBar t={t} type="crit">
                {(saveSetting.error as { error?: { message?: string } })?.error?.message ?? 'Failed to save setting.'}
              </AlertBar>
            )}
          </div>
        )}
      </Card>

      <Card t={t}>
        <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Duty Ledger Tools</h3>
        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 10, alignItems: mobile ? 'stretch' : 'center' }}>
          <input
            type="date"
            value={genDate}
            onChange={(e) => setGenDate(e.target.value)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() =>
              generateLedger.mutate(genDate, { onSuccess: () => setGenSuccess(`Duty ledger generated for ${genDate}.`) })
            }
            disabled={generateLedger.isPending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              minHeight: mobile ? MIN_TAP_TARGET : undefined,
              borderRadius: 6,
              border: 'none',
              background: t.pA,
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: generateLedger.isPending ? 'default' : 'pointer',
              opacity: generateLedger.isPending ? 0.7 : 1,
            }}
          >
            {generateLedger.isPending && <InlineSpinner size={11} />}
            {generateLedger.isPending ? 'Generating…' : 'Generate Ledger for Date'}
          </button>
        </div>
        {genSuccess && <AlertBar t={t} type="ok">{genSuccess}</AlertBar>}
        {generateLedger.isError && (
          <AlertBar t={t} type="crit">
            {(generateLedger.error as { error?: { message?: string } })?.error?.message ?? 'Failed to generate duty ledger.'}
          </AlertBar>
        )}
      </Card>
    </div>
  );
}
