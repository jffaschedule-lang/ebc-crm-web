import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor, THEME_META, ThemeName } from '../theme/tokens';
import { useBreakpoint, isMobile } from '../hooks/useBreakpoint';
import { apiGet, apiPatch } from '../api/client';
import { Setting } from '../types/domain';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { Card } from '../components/ui/Card';
import { MIN_TAP_TARGET } from '../theme/spacing';

const THEME_ORDER: ThemeName[] = ['command', 'daywatch', 'field'];

export default function Settings() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const t = tokensFor(theme);
  const bp = useBreakpoint();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
      <Card t={t}>
        <h3 style={{ fontSize: 14, fontWeight: 650, color: t.text, marginTop: 0, marginBottom: 4 }}>Theme</h3>
        <p style={{ fontSize: 12, color: t.textMuted, marginTop: 0, marginBottom: 14 }}>
          Choose the palette that fits how you're using the app right now. Your choice is saved to this device.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {THEME_ORDER.map((name) => {
            const meta = THEME_META[name];
            const tokens = tokensFor(name);
            const selected = theme === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setTheme(name)}
                aria-pressed={selected}
                style={{
                  textAlign: 'left',
                  minHeight: MIN_TAP_TARGET,
                  padding: 14,
                  borderRadius: 10,
                  border: `2px solid ${selected ? t.pA : t.border}`,
                  background: tokens.bg,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {[tokens.ok, tokens.train, tokens.info, tokens.crit].map((c) => (
                    <span key={c} style={{ width: 16, height: 16, borderRadius: '50%', background: c, display: 'inline-block' }} />
                  ))}
                </div>
                <div style={{ fontSize: 13, fontWeight: 650, color: tokens.text }}>
                  {meta.label} {selected && '✓'}
                </div>
                <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 2 }}>{meta.description}</div>
              </button>
            );
          })}
        </div>
      </Card>

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
