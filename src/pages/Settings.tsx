import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { tokensFor } from '../theme/tokens';
import { apiGet, apiPatch } from '../api/client';
import { Setting } from '../types/domain';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertBar } from '../components/ui/AlertBar';
import { Card } from '../components/ui/Card';

export default function Settings() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const t = tokensFor(theme);
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
    padding: '6px 8px',
    borderRadius: 6,
    border: `1px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.text,
    fontSize: 13,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
      <Card t={t}>
        <h3 style={{ fontSize: 13, color: t.text, marginTop: 0, marginBottom: 10 }}>Appearance</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: t.text }}>Theme: {theme}</span>
          <button
            type="button"
            onClick={toggleTheme}
            style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, cursor: 'pointer' }}
          >
            Toggle
          </button>
        </div>
      </Card>

      <Card t={t}>
        <h3 style={{ fontSize: 13, color: t.text, marginTop: 0, marginBottom: 10 }}>System Settings</h3>
        {isLoading && <LoadingSpinner t={t} />}
        {error && <AlertBar t={t} type="crit">Failed to load settings.</AlertBar>}
        {!isLoading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data ?? []).map((setting) => (
              <div key={setting.key} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 13, color: t.text }}>{setting.key}</div>
                  <div style={{ fontSize: 11, color: t.textMuted }}>{setting.description}</div>
                </div>
                <input
                  defaultValue={setting.value}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => updateSetting.mutate({ key: setting.key, value: drafts[setting.key] ?? setting.value })}
                  disabled={updateSetting.isPending}
                  style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: t.pA, color: '#fff', cursor: 'pointer', fontSize: 12 }}
                >
                  Save
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card t={t}>
        <h3 style={{ fontSize: 13, color: t.text, marginTop: 0, marginBottom: 10 }}>API Configuration</h3>
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
