import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ThemeTokens } from '../../theme/tokens';
import { Breakpoint, isMobile } from '../../hooks/useBreakpoint';
import { apiGet, apiPatch } from '../../api/client';
import { useSystemInfo, useNotificationRules, useUpdateNotificationRule, useSendTestEmail } from '../../hooks/useAdmin';
import { NotificationRule, Setting } from '../../types/domain';
import { Card } from '../../components/ui/Card';
import { AlertBar } from '../../components/ui/AlertBar';
import { LoadingSpinner, InlineSpinner } from '../../components/ui/LoadingSpinner';
import { RTable, RTableColumn } from '../../components/ui/RTable';
import { MIN_TAP_TARGET } from '../../theme/spacing';

interface TabProps {
  t: ThemeTokens;
  bp: Breakpoint;
}

export function NotificationsTab({ t, bp }: TabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 17, fontWeight: 650, color: t.text, margin: 0 }}>Email &amp; Notification Configuration</h2>
      <EmailSettingsSection t={t} bp={bp} />
      <NotificationRulesSection t={t} bp={bp} />
      <ShiftPacketScheduleSection t={t} bp={bp} />
    </div>
  );
}

function EmailSettingsSection({ t, bp }: TabProps) {
  const mobile = isMobile(bp);
  const queryClient = useQueryClient();
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiGet<Setting[]>('/api/settings'),
  });
  const { data: systemInfo, isLoading: infoLoading } = useSystemInfo();
  const sendTestEmail = useSendTestEmail();

  const fromEmailSetting = settings?.find((s) => s.key === 'from_email');
  const [fromEmailDraft, setFromEmailDraft] = useState('');
  const [testTo, setTestTo] = useState('');

  const updateFromEmail = useMutation({
    mutationFn: (value: string) => apiPatch(`/api/settings/from_email`, { value }),
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

  return (
    <Card t={t}>
      <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Email Settings</h3>
      {(settingsLoading || infoLoading) && <LoadingSpinner t={t} />}
      {!settingsLoading && !infoLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 10, alignItems: mobile ? 'stretch' : 'center' }}>
            <label style={{ fontSize: 12, color: t.textMuted, minWidth: 100 }}>From Email</label>
            <input
              placeholder={fromEmailSetting?.value ?? 'crm@ebc-fire.org'}
              defaultValue={fromEmailSetting?.value ?? ''}
              onChange={(e) => setFromEmailDraft(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={() => updateFromEmail.mutate(fromEmailDraft || fromEmailSetting?.value || '')}
              disabled={updateFromEmail.isPending}
              style={{
                padding: '8px 16px',
                minHeight: mobile ? MIN_TAP_TARGET : undefined,
                borderRadius: 6,
                border: 'none',
                background: t.pA,
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: t.textMuted, minWidth: 100 }}>SMTP Status</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 999,
                color: systemInfo?.emailProvider === 'Resend API' ? t.ok : t.textFaint,
                background: systemInfo?.emailProvider === 'Resend API' ? t.okBg : t.metricBg,
              }}
            >
              {systemInfo?.emailProvider ?? 'Not configured'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 10, alignItems: mobile ? 'stretch' : 'center' }}>
            <label style={{ fontSize: 12, color: t.textMuted, minWidth: 100 }}>Test Email</label>
            <input
              type="email"
              placeholder="you@ebc-fire.org"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={() => sendTestEmail.mutate(testTo)}
              disabled={!testTo || sendTestEmail.isPending}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                minHeight: mobile ? MIN_TAP_TARGET : undefined,
                borderRadius: 6,
                border: 'none',
                background: t.pA,
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                cursor: !testTo || sendTestEmail.isPending ? 'default' : 'pointer',
                opacity: !testTo || sendTestEmail.isPending ? 0.6 : 1,
              }}
            >
              {sendTestEmail.isPending && <InlineSpinner size={11} />}
              Send Test
            </button>
          </div>

          {updateFromEmail.isSuccess && <AlertBar t={t} type="ok">From email updated.</AlertBar>}
          {sendTestEmail.isSuccess && <AlertBar t={t} type="ok">Test email sent to {testTo}.</AlertBar>}
          {sendTestEmail.isError && (
            <AlertBar t={t} type="crit">
              {(sendTestEmail.error as { error?: { message?: string } })?.error?.message ?? 'Failed to send test email.'}
            </AlertBar>
          )}
        </div>
      )}
    </Card>
  );
}

function NotificationRulesSection({ t, bp }: TabProps) {
  const mobile = isMobile(bp);
  const { data, isLoading, error } = useNotificationRules(true);
  const updateRule = useUpdateNotificationRule();
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const rows = data ?? [];

  const cols: RTableColumn<NotificationRule>[] = [
    { key: 'event', header: 'Event', render: (r) => r.description ?? r.event },
    {
      key: 'enabled',
      header: 'Enabled',
      render: (r) => (
        <input
          type="checkbox"
          checked={r.enabled}
          onChange={(e) => updateRule.mutate({ event: r.event, changes: { enabled: e.target.checked } })}
          style={{ width: 18, height: 18 }}
        />
      ),
    },
    {
      key: 'recipients',
      header: 'Recipients',
      render: (r) =>
        editingEvent === r.event ? (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: `1px solid ${t.border}`,
              background: t.surfaceAlt,
              color: t.text,
              fontSize: 12,
              width: '100%',
            }}
          />
        ) : (
          r.recipients
        ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) =>
        editingEvent === r.event ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => {
                updateRule.mutate({ event: r.event, changes: { recipients: draft } });
                setEditingEvent(null);
              }}
              disabled={updateRule.isPending}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: 'none',
                background: t.pA,
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: mobile ? MIN_TAP_TARGET : undefined,
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingEvent(null)}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: `1px solid ${t.border}`,
                background: t.surfaceAlt,
                color: t.text,
                fontSize: 12,
                cursor: 'pointer',
                minHeight: mobile ? MIN_TAP_TARGET : undefined,
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditingEvent(r.event);
              setDraft(r.recipients);
            }}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              border: `1px solid ${t.border}`,
              background: t.surfaceAlt,
              color: t.text,
              fontSize: 12,
              cursor: 'pointer',
              minHeight: mobile ? MIN_TAP_TARGET : undefined,
            }}
          >
            Edit
          </button>
        ),
    },
  ];

  return (
    <Card t={t}>
      <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Notification Rules</h3>
      {isLoading && <LoadingSpinner t={t} />}
      {error && <AlertBar t={t} type="crit">Couldn't load notification rules.</AlertBar>}
      {updateRule.isError && (
        <AlertBar t={t} type="crit">
          {(updateRule.error as { error?: { message?: string } })?.error?.message ?? 'Failed to update rule.'}
        </AlertBar>
      )}
      {!isLoading && !error && (
        <RTable t={t} bp={bp} cols={cols} rows={rows} rowKey={(r) => r.event} emptyMessage="No notification rules configured." />
      )}
    </Card>
  );
}

function ShiftPacketScheduleSection({ t, bp }: TabProps) {
  const mobile = isMobile(bp);
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiGet<Setting[]>('/api/settings'),
  });
  const { data: systemInfo } = useSystemInfo();

  const packetTimeSetting = settings?.find((s) => s.key === 'packet_email_time');
  const timezoneSetting = settings?.find((s) => s.key === 'timezone');
  const [timeDraft, setTimeDraft] = useState('');

  const updatePacketTime = useMutation({
    mutationFn: (value: string) => apiPatch(`/api/settings/packet_email_time`, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-info'] });
    },
  });

  useEffect(() => {
    if (packetTimeSetting) setTimeDraft(packetTimeSetting.value);
  }, [packetTimeSetting]);

  return (
    <Card t={t}>
      <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>Shift Packet Schedule</h3>
      {isLoading && <LoadingSpinner t={t} />}
      {!isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 10, alignItems: mobile ? 'stretch' : 'center' }}>
            <label style={{ fontSize: 12, color: t.textMuted, minWidth: 140 }}>Packet send time</label>
            <input
              type="time"
              value={timeDraft}
              onChange={(e) => setTimeDraft(e.target.value)}
              style={{
                padding: '8px 10px',
                minHeight: mobile ? MIN_TAP_TARGET : undefined,
                borderRadius: 6,
                border: `1px solid ${t.border}`,
                background: t.surfaceAlt,
                color: t.text,
                fontSize: 13,
              }}
            />
            <button
              type="button"
              onClick={() => updatePacketTime.mutate(timeDraft)}
              disabled={updatePacketTime.isPending}
              style={{
                padding: '8px 16px',
                minHeight: mobile ? MIN_TAP_TARGET : undefined,
                borderRadius: 6,
                border: 'none',
                background: t.pA,
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: t.textMuted, minWidth: 140 }}>Timezone</span>
            <span style={{ fontSize: 13, color: t.text }}>{timezoneSetting?.value ?? systemInfo?.timezone ?? '—'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: t.textMuted, minWidth: 140 }}>Next scheduled run</span>
            <span style={{ fontSize: 13, color: t.text, fontFamily: 'ui-monospace, SF Mono, Consolas, monospace' }}>
              {systemInfo?.nextPacketRun ?? '—'}
            </span>
          </div>
          {updatePacketTime.isSuccess && <AlertBar t={t} type="ok">Packet send time updated.</AlertBar>}
        </div>
      )}
    </Card>
  );
}
