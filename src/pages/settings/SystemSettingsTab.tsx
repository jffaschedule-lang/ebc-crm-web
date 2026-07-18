import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ThemeTokens } from '../../theme/tokens';
import { Breakpoint, isMobile } from '../../hooks/useBreakpoint';
import { apiGet, apiPatch } from '../../api/client';
import { Setting } from '../../types/domain';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { AlertBar } from '../../components/ui/AlertBar';
import { Card } from '../../components/ui/Card';
import { MIN_TAP_TARGET } from '../../theme/spacing';

interface TabProps {
  t: ThemeTokens;
  bp: Breakpoint;
}

export function SystemSettingsTab({ t, bp }: TabProps) {
  const mobile = isMobile(bp);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiGet<Setting[]>('/api/settings'),
  });

  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const updateSetting = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => apiPatch(`/api/settings/${key}`, { value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const inputStyle: React.CSSProperties = {
    padding: '8px 10px',
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    fontSize: 13,
    minHeight: mobile ? MIN_TAP_TARGET : undefined,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card t={t}>
        <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 10 }}>System Settings</h3>
        {isLoading && <LoadingSpinner t={t} />}
        {error && <AlertBar t={t} type="crit">Couldn't load system settings. Check your connection and reload.</AlertBar>}
        {!isLoading && !error && (data ?? []).length === 0 && (
          <p style={{ fontSize: 13, color: t.textFaint }}>No configurable settings yet.</p>
        )}
        {!isLoading && !error && (data ?? []).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(data ?? []).map((setting) => (
              <div
                key={setting.key}
                style={{
                  display: 'flex',
                  flexDirection: mobile ? 'column' : 'row',
                  alignItems: mobile ? 'stretch' : 'center',
                  gap: 10,
                }}
              >
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 13, color: t.text, fontFamily: 'ui-monospace, SF Mono, Consolas, monospace' }}>
                    {setting.key}
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted }}>{setting.description}</div>
                </div>
                <input
                  defaultValue={setting.value}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                  style={{ ...inputStyle, width: mobile ? '100%' : undefined }}
                />
                <button
                  type="button"
                  onClick={() => updateSetting.mutate({ key: setting.key, value: drafts[setting.key] ?? setting.value })}
                  disabled={updateSetting.isPending}
                  style={{
                    padding: '8px 16px',
                    minHeight: mobile ? MIN_TAP_TARGET : undefined,
                    borderRadius: 6,
                    border: 'none',
                    background: t.pA,
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Save
                </button>
              </div>
            ))}
          </div>
        )}
        {updateSetting.isSuccess && <AlertBar t={t} type="ok">Setting saved.</AlertBar>}
        {updateSetting.isError && (
          <AlertBar t={t} type="crit">
            {(updateSetting.error as { error?: { message?: string } })?.error?.message ?? 'Failed to save setting.'}
          </AlertBar>
        )}
      </Card>

      <Card t={t}>
        <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 8 }}>API Configuration</h3>
        <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>
          API base URL: <code>{import.meta.env.VITE_API_BASE_URL}</code>
        </p>
        <p style={{ fontSize: 12, color: t.textMuted, marginTop: 8 }}>
          All business logic (leave slots, payroll, timesheets, PDF export, notifications) is computed by
          ebc-crm-api. This app never computes those answers itself — see the API reference in the backend README.
        </p>
      </Card>
    </div>
  );
}
